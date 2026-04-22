<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flat;
use App\Models\Notification;
use App\Models\TenantProfile;
use App\Models\User;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $users = User::with(['tenantProfile.flat'])
            ->where('building_id', $request->user()->building_id)
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => FrontendData::user($user));

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $this->validateUserData($request);

        $user = DB::transaction(function () use ($request, $data) {
            $user = User::create([
                'building_id' => $request->user()->building_id,
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'role' => $data['role'],
                'is_verified' => true,
                'password' => $data['password'],
            ]);

            $this->syncTenantProfile($user, $data);

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Welcome to BSMS',
                'message' => 'Your account has been created by the building administrator.',
                'type' => 'general',
            ]);

            return $user->fresh(['tenantProfile.flat']);
        });

        return response()->json(FrontendData::user($user), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);
        abort_unless($user->building_id === $request->user()->building_id, 404);

        $data = $this->validateUserData($request, $user);

        DB::transaction(function () use ($user, $data) {
            $attributes = [
                'name' => $data['name'] ?? $user->name,
                'email' => $data['email'] ?? $user->email,
                'phone' => array_key_exists('phone', $data) ? ($data['phone'] ?: null) : $user->phone,
                'role' => $data['role'] ?? $user->role,
            ];

            if (! empty($data['password'])) {
                $attributes['password'] = $data['password'];
            }

            $user->update($attributes);

            $this->syncTenantProfile($user->fresh('tenantProfile.flat'), $data);
        });

        return response()->json(FrontendData::user($user->fresh(['tenantProfile.flat'])));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);
        abort_unless($user->building_id === $request->user()->building_id, 404);
        abort_if($request->user()->id === $user->id, 422, 'You cannot delete your own account.');

        DB::transaction(function () use ($user) {
            if ($user->tenantProfile?->flat) {
                $user->tenantProfile->flat->update(['status' => 'vacant']);
            }

            $user->delete();
        });

        return response()->json(['message' => 'User deleted successfully.']);
    }

    private function validateUserData(Request $request, ?User $user = null): array
    {
        $passwordRules = $user
            ? ['nullable', 'string', 'min:8']
            : ['required', 'string', 'min:8'];

        return $request->validate([
            'name' => [$user ? 'sometimes' : 'required', 'string', 'max:255'],
            'email' => [$user ? 'sometimes' : 'required', 'email', 'max:255', 'unique:users,email,'.($user?->id ?? 'NULL')],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => [$user ? 'sometimes' : 'required', 'in:admin,owner,tenant,guard'],
            'password' => $passwordRules,
            'flatId' => ['nullable', 'integer', 'exists:flats,id'],
            'nid' => ['nullable', 'string', 'max:100'],
            'emergencyContact' => ['nullable', 'string', 'max:30'],
            'moveInDate' => ['nullable', 'date'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);
    }

    private function syncTenantProfile(User $user, array $data): void
    {
        $targetRole = $data['role'] ?? $user->role;
        $existingProfile = $user->tenantProfile()->with('flat')->first();

        if ($targetRole !== 'tenant') {
            if ($existingProfile?->flat) {
                $existingProfile->flat->update(['status' => 'vacant']);
            }

            $existingProfile?->delete();

            return;
        }

        $newFlatId = array_key_exists('flatId', $data) ? ($data['flatId'] ?: null) : $existingProfile?->flat_id;
        $newFlat = $newFlatId ? Flat::find($newFlatId) : null;
        $oldFlatId = $existingProfile?->flat_id;

        if ($existingProfile) {
            $existingProfile->update([
                'flat_id' => $newFlatId,
                'national_id' => array_key_exists('nid', $data) ? ($data['nid'] ?: null) : $existingProfile->national_id,
                'emergency_contact' => array_key_exists('emergencyContact', $data) ? ($data['emergencyContact'] ?: null) : $existingProfile->emergency_contact,
                'move_in_date' => array_key_exists('moveInDate', $data) ? ($data['moveInDate'] ?: null) : $existingProfile->move_in_date,
                'monthly_rent' => $newFlat?->monthly_rent,
                'is_active' => ($data['status'] ?? ($existingProfile->is_active ? 'active' : 'inactive')) === 'active',
            ]);
        } else {
            TenantProfile::create([
                'user_id' => $user->id,
                'flat_id' => $newFlatId,
                'national_id' => $data['nid'] ?? null,
                'emergency_contact' => $data['emergencyContact'] ?? null,
                'move_in_date' => $data['moveInDate'] ?? null,
                'monthly_rent' => $newFlat?->monthly_rent,
                'is_active' => ($data['status'] ?? 'active') === 'active',
            ]);
        }

        if ($oldFlatId && $oldFlatId !== $newFlatId) {
            Flat::whereKey($oldFlatId)->update(['status' => 'vacant']);
        }

        if ($newFlatId) {
            Flat::whereKey($newFlatId)->update(['status' => 'occupied']);
        }
    }
}
