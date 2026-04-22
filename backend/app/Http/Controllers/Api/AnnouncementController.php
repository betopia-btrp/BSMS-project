<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Support\FrontendData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Announcement::with(['author', 'readers'])->latest()->get()
                ->map(fn (Announcement $announcement) => FrontendData::announcement($announcement))
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'targetRole' => ['required', 'in:all,tenant,owner,guard'],
        ]);

        $announcement = Announcement::create([
            'building_id' => $request->user()->building_id,
            'author_id' => $request->user()->id,
            'title' => $data['title'],
            'content' => $data['content'],
            'target_role' => $data['targetRole'],
        ])->load(['author', 'readers']);

        return response()->json(FrontendData::announcement($announcement), 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json(FrontendData::announcement($announcement->load(['author', 'readers'])));
    }

    public function markRead(Request $request, Announcement $announcement): JsonResponse
    {
        $announcement->readers()->syncWithoutDetaching([
            $request->user()->id => ['read_at' => now()],
        ]);

        return response()->json(FrontendData::announcement($announcement->fresh(['author', 'readers'])));
    }
}
