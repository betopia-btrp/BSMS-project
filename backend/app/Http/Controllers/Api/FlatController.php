<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flat;
use App\Models\User;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Flat::with(['owner', 'tenantProfile.user'])->get()->map(fn (Flat $flat) => FrontendData::flat($flat))
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'number' => ['required', 'string', 'max:50'],
            'floor' => ['required', 'integer', 'min:1'],
            'size' => ['nullable', 'string', 'max:50'],
            'ownerId' => ['nullable', 'integer', 'exists:users,id'],
            'ownerName' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:vacant,occupied,maintenance'],
            'monthlyRent' => ['required', 'numeric', 'min:0'],
        ]);

        $ownerId = $data['ownerId'] ?? null;
        if (! $ownerId && ! empty($data['ownerName'])) {
            $ownerId = User::where('name', $data['ownerName'])->where('role', 'owner')->value('id');
        }

        $flat = Flat::create([
            'building_id' => $request->user()->building_id,
            'owner_id' => $ownerId,
            'number' => $data['number'],
            'floor' => $data['floor'],
            'size_sqft' => $this->extractSize($data['size'] ?? null),
            'status' => $data['status'],
            'monthly_rent' => $data['monthlyRent'],
        ])->load(['owner', 'tenantProfile.user']);

        return response()->json(FrontendData::flat($flat), 201);
    }

    public function show(Flat $flat): JsonResponse
    {
        return response()->json(FrontendData::flat($flat->load(['owner', 'tenantProfile.user'])));
    }

    public function update(Request $request, Flat $flat): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'number' => ['sometimes', 'string', 'max:50'],
            'floor' => ['sometimes', 'integer', 'min:1'],
            'size' => ['nullable', 'string', 'max:50'],
            'ownerId' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['sometimes', 'in:vacant,occupied,maintenance'],
            'monthlyRent' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $flat->fill([
            'number' => $data['number'] ?? $flat->number,
            'floor' => $data['floor'] ?? $flat->floor,
            'size_sqft' => array_key_exists('size', $data) ? $this->extractSize($data['size']) : $flat->size_sqft,
            'owner_id' => $data['ownerId'] ?? $flat->owner_id,
            'status' => $data['status'] ?? $flat->status,
            'monthly_rent' => $data['monthlyRent'] ?? $flat->monthly_rent,
        ])->save();

        return response()->json(FrontendData::flat($flat->fresh(['owner', 'tenantProfile.user'])));
    }

    public function destroy(Request $request, Flat $flat): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);
        $flat->delete();

        return response()->json(['message' => 'Flat deleted']);
    }

    private function extractSize(?string $size): ?float
    {
        if (! $size) {
            return null;
        }

        return (float) preg_replace('/[^0-9.]/', '', $size);
    }
}
