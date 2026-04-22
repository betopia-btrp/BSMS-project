<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AppDataController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FlatController;
use App\Http\Controllers\Api\MaintenanceTicketController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\VisitorController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth.token')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/bootstrap', [AppDataController::class, 'index']);

    Route::apiResource('flats', FlatController::class)->except(['create', 'edit']);
    Route::apiResource('tenants', TenantController::class)->except(['create', 'edit']);
    Route::apiResource('payments', PaymentController::class)->only(['index', 'store']);
    Route::patch('/payments/{payment}/status', [PaymentController::class, 'updateStatus']);

    Route::apiResource('tickets', MaintenanceTicketController::class)->except(['create', 'edit']);
    Route::post('/tickets/{ticket}/notes', [MaintenanceTicketController::class, 'storeNote']);

    Route::apiResource('visitors', VisitorController::class)->except(['create', 'edit']);
    Route::patch('/visitors/{visitor}/arrive', [VisitorController::class, 'markArrived']);
    Route::patch('/visitors/{visitor}/exit', [VisitorController::class, 'markExited']);

    Route::apiResource('announcements', AnnouncementController::class)->except(['create', 'edit', 'update', 'destroy']);
    Route::post('/announcements/{announcement}/read', [AnnouncementController::class, 'markRead']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
});
