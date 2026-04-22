<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            Notification::where('user_id', $request->user()->id)->latest()->get()
                ->map(fn (Notification $notification) => FrontendData::notification($notification))
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['required', 'in:payment,maintenance,visitor,announcement,general'],
        ]);

        $notification = Notification::create([
            'user_id' => $data['userId'],
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'],
        ]);

        return response()->json(FrontendData::notification($notification), 201);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return response()->json(FrontendData::notification($notification));
    }
}
