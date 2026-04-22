import { User, Flat, Tenant, Payment, MaintenanceTicket, Visitor, Announcement, Notification } from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin Rahman', email: 'admin@bsms.com', role: 'admin', phone: '01700000001', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Mr. Karim', email: 'owner@bsms.com', role: 'owner', phone: '01700000002', flatId: 'f1', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Rahim Mia', email: 'tenant@bsms.com', role: 'tenant', phone: '01700000003', flatId: 'f1', createdAt: '2024-02-01' },
  { id: 'u4', name: 'Guard Hasan', email: 'guard@bsms.com', role: 'guard', phone: '01700000004', createdAt: '2024-01-10' },
  { id: 'u5', name: 'Mrs. Sultana', email: 'owner2@bsms.com', role: 'owner', phone: '01700000005', flatId: 'f2', createdAt: '2024-01-06' },
  { id: 'u6', name: 'Salam Ahmed', email: 'tenant2@bsms.com', role: 'tenant', phone: '01700000006', flatId: 'f3', createdAt: '2024-03-01' },
];

export const mockFlats: Flat[] = [
  { id: 'f1', number: 'A-101', floor: 1, size: '1200 sqft', ownerId: 'u2', ownerName: 'Mr. Karim', tenantId: 'u3', tenantName: 'Rahim Mia', status: 'occupied', monthlyRent: 25000, createdAt: '2024-01-01' },
  { id: 'f2', number: 'A-102', floor: 1, size: '1400 sqft', ownerId: 'u5', ownerName: 'Mrs. Sultana', status: 'vacant', monthlyRent: 30000, createdAt: '2024-01-01' },
  { id: 'f3', number: 'B-201', floor: 2, size: '1100 sqft', ownerId: 'u2', ownerName: 'Mr. Karim', tenantId: 'u6', tenantName: 'Salam Ahmed', status: 'occupied', monthlyRent: 22000, createdAt: '2024-01-01' },
  { id: 'f4', number: 'B-202', floor: 2, size: '1300 sqft', status: 'maintenance', monthlyRent: 28000, createdAt: '2024-01-01' },
  { id: 'f5', number: 'C-301', floor: 3, size: '1500 sqft', ownerId: 'u5', ownerName: 'Mrs. Sultana', status: 'vacant', monthlyRent: 35000, createdAt: '2024-01-01' },
  { id: 'f6', number: 'C-302', floor: 3, size: '1600 sqft', ownerId: 'u2', ownerName: 'Mr. Karim', status: 'vacant', monthlyRent: 38000, createdAt: '2024-01-01' },
];

export const mockTenants: Tenant[] = [
  { id: 't1', userId: 'u3', name: 'Rahim Mia', email: 'tenant@bsms.com', phone: '01700000003', nid: '1234567890', flatId: 'f1', flatNumber: 'A-101', emergencyContact: '01800000001', moveInDate: '2024-02-01', status: 'active' },
  { id: 't2', userId: 'u6', name: 'Salam Ahmed', email: 'tenant2@bsms.com', phone: '01700000006', nid: '0987654321', flatId: 'f3', flatNumber: 'B-201', moveInDate: '2024-03-01', status: 'active' },
];

export const mockPayments: Payment[] = [
  { id: 'p1', tenantId: 't1', tenantName: 'Rahim Mia', flatId: 'f1', flatNumber: 'A-101', ownerId: 'u2', ownerName: 'Mr. Karim', amount: 25000, type: 'rent', status: 'paid', method: 'bkash', month: '2025-04', dueDate: '2025-04-05', paidDate: '2025-04-03', invoiceNumber: 'INV-2025-001', recipient: 'owner' },
  { id: 'p2', tenantId: 't1', tenantName: 'Rahim Mia', flatId: 'f1', flatNumber: 'A-101', amount: 3500, type: 'service_charge', status: 'paid', method: 'nagad', month: '2025-04', dueDate: '2025-04-05', paidDate: '2025-04-03', invoiceNumber: 'INV-2025-002', recipient: 'admin' },
  { id: 'p3', tenantId: 't2', tenantName: 'Salam Ahmed', flatId: 'f3', flatNumber: 'B-201', ownerId: 'u2', ownerName: 'Mr. Karim', amount: 22000, type: 'rent', status: 'unpaid', month: '2025-04', dueDate: '2025-04-05', invoiceNumber: 'INV-2025-003', recipient: 'owner' },
  { id: 'p4', tenantId: 't2', tenantName: 'Salam Ahmed', flatId: 'f3', flatNumber: 'B-201', amount: 3500, type: 'service_charge', status: 'overdue', month: '2025-03', dueDate: '2025-03-05', invoiceNumber: 'INV-2025-004', recipient: 'admin' },
  { id: 'p5', tenantId: 't1', tenantName: 'Rahim Mia', flatId: 'f1', flatNumber: 'A-101', ownerId: 'u2', ownerName: 'Mr. Karim', amount: 25000, type: 'rent', status: 'paid', method: 'card', month: '2025-03', dueDate: '2025-03-05', paidDate: '2025-03-02', invoiceNumber: 'INV-2025-005', recipient: 'owner' },
];

export const mockTickets: MaintenanceTicket[] = [
  { id: 'm1', ticketId: 'TKT-001', tenantId: 't1', tenantName: 'Rahim Mia', flatId: 'f1', flatNumber: 'A-101', category: 'plumbing', description: 'Water leakage in bathroom pipe', status: 'in_progress', priority: 'high', notes: ['Assigned to plumber', 'Parts ordered'], createdAt: '2025-04-10T10:00:00', updatedAt: '2025-04-11T14:00:00' },
  { id: 'm2', ticketId: 'TKT-002', tenantId: 't2', tenantName: 'Salam Ahmed', flatId: 'f3', flatNumber: 'B-201', category: 'electrical', description: 'Ceiling fan not working', status: 'open', priority: 'medium', notes: [], createdAt: '2025-04-15T09:00:00', updatedAt: '2025-04-15T09:00:00' },
  { id: 'm3', ticketId: 'TKT-003', tenantId: 't1', tenantName: 'Rahim Mia', flatId: 'f1', flatNumber: 'A-101', category: 'carpentry', description: 'Door hinge broken', status: 'resolved', priority: 'low', notes: ['Fixed on 10th April'], createdAt: '2025-04-08T11:00:00', updatedAt: '2025-04-10T16:00:00' },
];

export const mockVisitors: Visitor[] = [
  { id: 'v1', name: 'Jamal Hossain', phone: '01900000001', flatId: 'f1', flatNumber: 'A-101', tenantId: 't1', tenantName: 'Rahim Mia', purpose: 'Family visit', type: 'expected', status: 'arrived', visitDate: '2025-04-21', expectedTime: '14:00', entryTime: '14:05', loggedBy: 'u4' },
  { id: 'v2', name: 'Delivery Man', phone: '01900000002', flatId: 'f3', flatNumber: 'B-201', type: 'walkin', status: 'exited', entryTime: '11:00', exitTime: '11:15', duration: '15 min', loggedBy: 'u4' },
  { id: 'v3', name: 'Fatima Begum', phone: '01900000003', flatId: 'f1', flatNumber: 'A-101', tenantId: 't1', tenantName: 'Rahim Mia', purpose: 'Personal', type: 'expected', status: 'pending', visitDate: '2025-04-22', expectedTime: '16:00' },
];

export const mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Water Supply Maintenance', content: 'Water supply will be shut down on April 23rd from 10 AM to 2 PM for maintenance work. Please store water accordingly.', authorId: 'u1', authorName: 'Admin Rahman', targetRole: 'all', createdAt: '2025-04-20T10:00:00', readBy: ['u3'] },
  { id: 'a2', title: 'Monthly Society Meeting', content: 'There will be a monthly society meeting on April 28th at 6 PM in the community hall. All owners are requested to attend.', authorId: 'u1', authorName: 'Admin Rahman', targetRole: 'owner', createdAt: '2025-04-18T09:00:00', readBy: [] },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u3', title: 'Payment Due', message: 'Your April service charge is due on April 30th.', type: 'payment', read: false, createdAt: '2025-04-20T08:00:00' },
  { id: 'n2', userId: 'u3', title: 'Maintenance Update', message: 'Your plumbing ticket TKT-001 is in progress.', type: 'maintenance', read: true, createdAt: '2025-04-11T14:00:00' },
  { id: 'n3', userId: 'u2', title: 'Rent Received', message: 'Rahim Mia has paid April rent for Flat A-101.', type: 'payment', read: false, createdAt: '2025-04-03T10:00:00' },
];

export const paymentTrends = [
  { month: 'Nov', rent: 47000, service: 7000 },
  { month: 'Dec', rent: 47000, service: 7000 },
  { month: 'Jan', rent: 47000, service: 7000 },
  { month: 'Feb', rent: 47000, service: 7000 },
  { month: 'Mar', rent: 47000, service: 7000 },
  { month: 'Apr', rent: 25000, service: 3500 },
];
