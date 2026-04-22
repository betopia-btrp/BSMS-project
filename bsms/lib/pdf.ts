import { formatCurrency, formatDate } from '@/lib/utils';
import { Payment } from '@/types';

type PdfSection = {
  heading?: string;
  lines: string[];
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT_MARGIN = 50;
const TOP_MARGIN = 60;
const BOTTOM_MARGIN = 50;
const FONT_SIZE = 11;
const TITLE_SIZE = 18;
const SUBTITLE_SIZE = 11;
const LINE_HEIGHT = 16;
const MAX_TEXT_WIDTH = PAGE_WIDTH - LEFT_MARGIN * 2;
const AVG_CHAR_WIDTH = FONT_SIZE * 0.55;
const MAX_CHARS_PER_LINE = Math.max(40, Math.floor(MAX_TEXT_WIDTH / AVG_CHAR_WIDTH));

function sanitizeFilePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');
}

function wrapLine(line: string, maxChars = MAX_CHARS_PER_LINE): string[] {
  if (line.length <= maxChars) {
    return [line];
  }

  const words = line.split(/\s+/);
  const wrapped: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      wrapped.push(current);
      current = word;
      continue;
    }

    let remaining = word;
    while (remaining.length > maxChars) {
      wrapped.push(remaining.slice(0, maxChars - 1) + '-');
      remaining = remaining.slice(maxChars - 1);
    }
    current = remaining;
  }

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}

function buildPages(title: string, subtitle: string | undefined, sections: PdfSection[]): string[][] {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let lineCount = 0;
  const maxLines = Math.floor((PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN) / LINE_HEIGHT);

  const pushLine = (line: string) => {
    const wrappedLines = wrapLine(line);
    for (const wrappedLine of wrappedLines) {
      if (lineCount >= maxLines) {
        pages.push(currentPage);
        currentPage = [];
        lineCount = 0;
      }
      currentPage.push(wrappedLine);
      lineCount += 1;
    }
  };

  pushLine(title);
  if (subtitle) {
    pushLine(subtitle);
  }
  pushLine(`Generated: ${new Date().toLocaleString('en-BD')}`);
  pushLine('');

  for (const section of sections) {
    if (section.heading) {
      pushLine(section.heading);
    }
    for (const line of section.lines) {
      pushLine(line);
    }
    pushLine('');
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function pageStream(lines: string[], pageNumber: number, pageCount: number): string {
  const commands: string[] = [];
  let y = PAGE_HEIGHT - TOP_MARGIN;

  lines.forEach((line, index) => {
    const fontSize = index === 0 ? TITLE_SIZE : index === 1 ? SUBTITLE_SIZE : FONT_SIZE;

    if (index === 0) {
      y = PAGE_HEIGHT - TOP_MARGIN;
    } else if (index === 1) {
      y -= LINE_HEIGHT + 6;
    } else if (index === 2) {
      y -= LINE_HEIGHT + 4;
    } else if (line.trim() === '') {
      y -= Math.floor(LINE_HEIGHT * 0.7);
    } else {
      y -= LINE_HEIGHT;
    }

    if (line.trim() === '') {
      return;
    }

    commands.push('BT');
    commands.push(`/F1 ${fontSize} Tf`);
    commands.push(`1 0 0 1 ${LEFT_MARGIN} ${y} Tm`);
    commands.push(`(${escapePdfText(line)}) Tj`);
    commands.push('ET');
  });

  commands.push('BT');
  commands.push(`/F1 9 Tf`);
  commands.push(`1 0 0 1 ${LEFT_MARGIN} 24 Tm`);
  commands.push(`(Page ${pageNumber} of ${pageCount}) Tj`);
  commands.push('ET');

  return commands.join('\n');
}

function createPdfBlob(title: string, subtitle: string | undefined, sections: PdfSection[]): Blob {
  const pages = buildPages(title, subtitle, sections);
  const pageCount = pages.length;
  const objects: string[] = [];

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');

  const pageObjectIds = pages.map((_, index) => 3 + index * 2);
  const contentObjectIds = pages.map((_, index) => 4 + index * 2);

  objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>`);

  pages.forEach((lines, index) => {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${3 + pageCount * 2} 0 R >> >> /Contents ${contentId} 0 R >>`;

    const stream = pageStream(lines, index + 1, pageCount);
    objects[contentId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  const fontObjectId = 3 + pageCount * 2;
  objects[fontObjectId - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadPdfDocument(filename: string, title: string, sections: PdfSection[], subtitle?: string): void {
  const blob = createPdfBlob(title, subtitle, sections);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPaymentReceipt(payment: Payment): void {
  const filename = `receipt-${sanitizeFilePart(payment.invoiceNumber)}`;
  const recipientLabel = payment.recipient === 'owner' ? (payment.ownerName || 'Owner') : 'Admin (BSMS)';
  const sections: PdfSection[] = [
    {
      heading: 'Receipt Details',
      lines: [
        `Invoice Number: ${payment.invoiceNumber}`,
        `Tenant: ${payment.tenantName}`,
        `Flat: ${payment.flatNumber}`,
        `Amount: ${formatCurrency(payment.amount).replace('৳', 'BDT ')}`,
        `Type: ${payment.type.replace(/_/g, ' ')}`,
        `Billing Month: ${payment.month}`,
        `Recipient: ${recipientLabel}`,
        `Method: ${payment.method || 'N/A'}`,
        `Due Date: ${formatDate(payment.dueDate)}`,
        `Paid Date: ${payment.paidDate ? formatDate(payment.paidDate) : 'N/A'}`,
        `Status: ${payment.status}`,
      ],
    },
    {
      heading: 'Notes',
      lines: [
        'This document was generated automatically by BSMS as a payment receipt.',
      ],
    },
  ];

  downloadPdfDocument(filename, 'BSMS Payment Receipt', sections, `Receipt for ${payment.invoiceNumber}`);
}
