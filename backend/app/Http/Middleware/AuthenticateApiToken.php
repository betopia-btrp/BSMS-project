<?php

namespace App\Http\Middleware;

use App\Models\AuthToken;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return new JsonResponse(['message' => 'Unauthenticated.'], 401);
        }

        $authToken = AuthToken::with('user.tenantProfile.flat')
            ->where('token_hash', hash('sha256', $token))
            ->first();

        if (! $authToken || ($authToken->expires_at && $authToken->expires_at->isPast())) {
            return new JsonResponse(['message' => 'Invalid or expired token.'], 401);
        }

        $authToken->forceFill(['last_used_at' => Carbon::now()])->save();
        $request->setUserResolver(fn () => $authToken->user);

        return $next($request);
    }
}
