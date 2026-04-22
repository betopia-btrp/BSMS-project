<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flat;
use App\Models\Visitor;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Visitor::with(['flat', 'tenantProfile.user'])->latest()->get()
                ->map(fn (Visitor $visitor) => FrontendData::visitor($visitor))
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['tenant', 'guard'], true), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'nid' => ['nullable', 'string', 'max:100'],
            'flatId' => ['nullable', 'integer', 'exists:flats,id'],
            'flatNumber' => ['nullable', 'string', 'max:50'],
            'purpose' => ['nullable', 'string'],
            'type' => ['required', 'in:walkin,expected'],
            'visitDate' => ['nullable', 'date'],
            'expectedTime' => ['nullable', 'date_format:H:i'],
            'loggedBy' => ['nullable', 'integer'],
        ]);

        $flat = ! empty($data['flatId'])
            ? Flat::findOrFail($data['flatId'])
            : Flat::where('number', $data['flatNumber'] ?? '')->firstOrFail();

        $tenantProfileId = $request->user()->role === 'tenant'
            ? $request->user()->tenantProfile?->id
            : $flat->tenantProfile?->id;

        $visitor = Visitor::create([
            'building_id' => $flat->building_id,
            'flat_id' => $flat->id,
            'tenant_profile_id' => $tenantProfileId,
            'guard_id' => $request->user()->role === 'guard' ? $request->user()->id : ($data['loggedBy'] ?? null),
            'name' => $data['name'],
            'phone' => $data['phone'],
            'national_id' => $data['nid'] ?? null,
            'purpose' => $data['purpose'] ?? null,
            'type' => $data['type'],
            'status' => $data['type'] === 'walkin' ? 'arrived' : 'pending',
            'visit_date' => $data['visitDate'] ?? null,
            'expected_time' => $data['expectedTime'] ?? null,
            'entry_time' => $data['type'] === 'walkin' ? now() : null,
        ])->load(['flat', 'tenantProfile.user']);

        return response()->json(FrontendData::visitor($visitor), 201);
    }

    public function show(Visitor $visitor): JsonResponse
    {
        return response()->json(FrontendData::visitor($visitor->load(['flat', 'tenantProfile.user'])));
    }

    public function update(Request $request, Visitor $visitor): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['tenant', 'admin'], true), 403);

        if ($request->user()->role === 'tenant') {
            abort_unless($visitor->tenantProfile?->user_id === $request->user()->id, 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'nid' => ['nullable', 'string', 'max:100'],
            'visitDate' => ['nullable', 'date'],
            'expectedTime' => ['nullable', 'date_format:H:i'],
            'purpose' => ['nullable', 'string'],
        ]);

        $visitor->update([
            'name' => $data['name'] ?? $visitor->name,
            'phone' => $data['phone'] ?? $visitor->phone,
            'national_id' => $data['nid'] ?? $visitor->national_id,
            'visit_date' => $data['visitDate'] ?? $visitor->visit_date,
            'expected_time' => $data['expectedTime'] ?? $visitor->expected_time,
            'purpose' => $data['purpose'] ?? $visitor->purpose,
        ]);

        return response()->json(FrontendData::visitor($visitor->fresh(['flat', 'tenantProfile.user'])));
    }

    public function destroy(Request $request, Visitor $visitor): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['tenant', 'admin'], true), 403);

        if ($request->user()->role === 'tenant') {
            abort_unless($visitor->tenantProfile?->user_id === $request->user()->id, 403);
        }

        $visitor->delete();

        return response()->json(['message' => 'Visitor deleted']);
    }

    public function markArrived(Request $request, Visitor $visitor): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['guard', 'admin'], true), 403);

        $visitor->update([
            'status' => 'arrived',
            'guard_id' => $request->user()->id,
            'entry_time' => now(),
        ]);

        return response()->json(FrontendData::visitor($visitor->fresh(['flat', 'tenantProfile.user'])));
    }

    public function markExited(Request $request, Visitor $visitor): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['guard', 'admin'], true), 403);

        $visitor->update([
            'status' => 'exited',
            'guard_id' => $request->user()->id,
            'exit_time' => now(),
        ]);

        return response()->json(FrontendData::visitor($visitor->fresh(['flat', 'tenantProfile.user'])));
    }
}
