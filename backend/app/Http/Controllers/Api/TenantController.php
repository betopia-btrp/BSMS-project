<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flat;
use App\Models\TenantProfile;
use App\Models\User;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            TenantProfile::with(['user', 'flat'])->get()->map(fn (TenantProfile $profile) => FrontendData::tenant($profile))
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'nid' => ['required', 'string', 'max:100'],
            'flatId' => ['nullable', 'integer', 'exists:flats,id'],
            'emergencyContact' => ['nullable', 'string', 'max:30'],
            'moveInDate' => ['nullable', 'date'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $profile = DB::transaction(function () use ($request, $data) {
            $user = User::create([
                'building_id' => $request->user()->building_id,
                'name' => $data['name'],
                'email' => $data['email'] ?: 'tenant-'.Str::uuid().'@bsms.local',
                'phone' => $data['phone'],
                'role' => 'tenant',
                'is_verified' => true,
                'password' => Hash::make('password123'),
            ]);

            $flat = ! empty($data['flatId']) ? Flat::find($data['flatId']) : null;

            $profile = TenantProfile::create([
                'user_id' => $user->id,
                'flat_id' => $flat?->id,
                'national_id' => $data['nid'],
                'emergency_contact' => $data['emergencyContact'] ?? null,
                'move_in_date' => $data['moveInDate'] ?? null,
                'monthly_rent' => $flat?->monthly_rent,
                'is_active' => $data['status'] === 'active',
            ]);

            if ($flat) {
                $flat->update(['status' => 'occupied']);
            }

            return $profile->load(['user', 'flat']);
        });

        return response()->json(FrontendData::tenant($profile), 201);
    }

    public function show(TenantProfile $tenant): JsonResponse
    {
        return response()->json(FrontendData::tenant($tenant->load(['user', 'flat'])));
    }

    public function update(Request $request, TenantProfile $tenant): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'nid' => ['sometimes', 'string', 'max:100'],
            'flatId' => ['nullable', 'integer', 'exists:flats,id'],
            'emergencyContact' => ['nullable', 'string', 'max:30'],
            'moveInDate' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        DB::transaction(function () use ($tenant, $data) {
            $oldFlat = $tenant->flat;
            $newFlat = array_key_exists('flatId', $data) && $data['flatId'] ? Flat::find($data['flatId']) : null;

            $tenant->user->update([
                'name' => $data['name'] ?? $tenant->user->name,
                'email' => $data['email'] ?? $tenant->user->email,
                'phone' => $data['phone'] ?? $tenant->user->phone,
            ]);

            $tenant->update([
                'flat_id' => array_key_exists('flatId', $data) ? $data['flatId'] : $tenant->flat_id,
                'national_id' => $data['nid'] ?? $tenant->national_id,
                'emergency_contact' => $data['emergencyContact'] ?? $tenant->emergency_contact,
                'move_in_date' => $data['moveInDate'] ?? $tenant->move_in_date,
                'monthly_rent' => array_key_exists('flatId', $data) ? $newFlat?->monthly_rent : $tenant->monthly_rent,
                'is_active' => ($data['status'] ?? ($tenant->is_active ? 'active' : 'inactive')) === 'active',
            ]);

            if ($oldFlat && $oldFlat->id !== $tenant->flat_id) {
                $oldFlat->update(['status' => 'vacant']);
            }

            if ($tenant->flat_id) {
                Flat::whereKey($tenant->flat_id)->update(['status' => 'occupied']);
            }
        });

        return response()->json(FrontendData::tenant($tenant->fresh(['user', 'flat'])));
    }

    public function destroy(Request $request, TenantProfile $tenant): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        if ($tenant->flat) {
            $tenant->flat->update(['status' => 'vacant']);
        }

        $tenant->user()->delete();

        return response()->json(['message' => 'Tenant deleted']);
    }
}
