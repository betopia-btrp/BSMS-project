<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Flat;
use App\Models\MaintenanceTicket;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\TenantProfile;
use App\Models\Visitor;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppDataController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenantProfile = $user->tenantProfile;

        $flats = Flat::with(['owner', 'tenantProfile.user'])->get();
        $tenants = TenantProfile::with(['user', 'flat'])->get();
        $payments = Payment::with(['tenantProfile.user', 'flat', 'owner'])->get();
        $tickets = MaintenanceTicket::with(['tenantProfile.user', 'flat', 'notes'])->latest()->get();
        $visitors = Visitor::with(['flat', 'tenantProfile.user'])->latest()->get();
        $announcements = Announcement::with(['author', 'readers'])->latest()->get();
        $notifications = Notification::where('user_id', $user->id)->latest()->get();

        if ($user->role === 'owner') {
            $ownedFlatIds = $flats->where('owner_id', $user->id)->pluck('id');
            $flats = $flats->whereIn('id', $ownedFlatIds);
            $payments = $payments->where('owner_id', $user->id);
            $tickets = $tickets->whereIn('flat_id', $ownedFlatIds);
            $visitors = $visitors->whereIn('flat_id', $ownedFlatIds);
            $tenants = $tenants->whereIn('flat_id', $ownedFlatIds);
        }

        if ($user->role === 'tenant' && $tenantProfile) {
            $flats = $flats->where('id', $tenantProfile->flat_id);
            $tenants = $tenants->where('id', $tenantProfile->id);
            $payments = $payments->where('tenant_profile_id', $tenantProfile->id);
            $tickets = $tickets->where('tenant_profile_id', $tenantProfile->id);
            $visitors = $visitors->where('tenant_profile_id', $tenantProfile->id);
        }

        if ($user->role === 'guard') {
            $tenants = collect();
            $payments = collect();
            $tickets = collect();
        }

        $announcements = $announcements->filter(
            fn (Announcement $announcement) => $announcement->target_role === 'all' || $announcement->target_role === $user->role
        );

        return response()->json([
            'flats' => $flats->values()->map(fn (Flat $flat) => FrontendData::flat($flat)),
            'tenants' => $tenants->values()->map(fn (TenantProfile $profile) => FrontendData::tenant($profile)),
            'payments' => $payments->values()->map(fn (Payment $payment) => FrontendData::payment($payment)),
            'tickets' => $tickets->values()->map(fn (MaintenanceTicket $ticket) => FrontendData::ticket($ticket)),
            'visitors' => $visitors->values()->map(fn (Visitor $visitor) => FrontendData::visitor($visitor)),
            'announcements' => $announcements->values()->map(fn (Announcement $announcement) => FrontendData::announcement($announcement)),
            'notifications' => $notifications->values()->map(fn (Notification $notification) => FrontendData::notification($notification)),
        ]);
    }
}
