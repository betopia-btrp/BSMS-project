<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Payment::with(['tenantProfile.user', 'flat', 'owner'])->get()->map(fn (Payment $payment) => FrontendData::payment($payment))
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'tenantProfileId' => ['required', 'integer', 'exists:tenant_profiles,id'],
            'flatId' => ['required', 'integer', 'exists:flats,id'],
            'ownerId' => ['nullable', 'integer', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'type' => ['required', 'in:rent,service_charge,utility,maintenance_fee'],
            'status' => ['required', 'in:paid,unpaid,overdue'],
            'method' => ['nullable', 'in:bkash,nagad,card,cash'],
            'month' => ['required', 'string', 'max:7'],
            'dueDate' => ['required', 'date'],
            'invoiceNumber' => ['required', 'string', 'max:100', 'unique:payments,invoice_number'],
            'recipient' => ['required', 'in:owner,admin'],
        ]);

        $payment = Payment::create([
            'tenant_profile_id' => $data['tenantProfileId'],
            'flat_id' => $data['flatId'],
            'owner_id' => $data['ownerId'] ?? null,
            'amount' => $data['amount'],
            'type' => $data['type'],
            'status' => $data['status'],
            'method' => $data['method'] ?? null,
            'billing_month' => $data['month'],
            'due_date' => $data['dueDate'],
            'invoice_number' => $data['invoiceNumber'],
            'recipient' => $data['recipient'],
        ])->load(['tenantProfile.user', 'flat', 'owner']);

        return response()->json(FrontendData::payment($payment), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json(FrontendData::payment($payment->load(['tenantProfile.user', 'flat', 'owner'])));
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        abort(405);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        abort(405);
    }

    public function updateStatus(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'tenant') {
            abort_unless($payment->tenantProfile?->user_id === $user->id, 403);
        } elseif ($user->role !== 'admin') {
            abort(403);
        }

        $data = $request->validate([
            'status' => ['required', 'in:paid,unpaid,overdue'],
            'method' => ['nullable', 'in:bkash,nagad,card,cash'],
        ]);

        $payment->update([
            'status' => $data['status'],
            'method' => $data['method'] ?? $payment->method,
            'paid_at' => $data['status'] === 'paid' ? now() : null,
        ]);

        return response()->json(FrontendData::payment($payment->fresh(['tenantProfile.user', 'flat', 'owner'])));
    }
}
