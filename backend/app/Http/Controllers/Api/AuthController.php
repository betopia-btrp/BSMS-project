<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuthToken;
use App\Models\Building;
use App\Models\Notification;
use App\Models\User;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::with('tenantProfile.flat')->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 422);
        }

        [$plainTextToken, $token] = $this->issueToken($user, $request);

        return response()->json([
            'token' => $plainTextToken,
            'user' => FrontendData::user($user),
            'token_meta' => ['id' => $token->id],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:admin,owner,tenant,guard'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $building = Building::query()->first() ?? Building::create([
                'name' => 'BSMS Central Building',
                'address' => 'Demo address',
                'plan_tier' => 'premium',
            ]);

            $user = User::create([
                'building_id' => $building->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'role' => $data['role'],
                'is_verified' => false,
                'password' => $data['password'],
            ]);

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Welcome to BSMS',
                'message' => 'Your account has been created successfully.',
                'type' => 'general',
            ]);

            return $user->load('tenantProfile.flat');
        });

        return response()->json([
            'message' => 'Account created successfully.',
            'user' => FrontendData::user($user),
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => FrontendData::user($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if ($token) {
            AuthToken::where('token_hash', hash('sha256', $token))->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }

    private function issueToken(User $user, Request $request): array
    {
        $plainTextToken = Str::random(64);

        $token = AuthToken::create([
            'user_id' => $user->id,
            'name' => 'web',
            'token_hash' => hash('sha256', $plainTextToken),
            'last_used_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
        ]);

        return [$plainTextToken, $token];
    }
}
