<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visitor extends Model
{
    protected $fillable = [
        'building_id',
        'flat_id',
        'tenant_profile_id',
        'guard_id',
        'name',
        'phone',
        'national_id',
        'purpose',
        'type',
        'status',
        'visit_date',
        'expected_time',
        'entry_time',
        'exit_time',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'entry_time' => 'datetime',
            'exit_time' => 'datetime',
        ];
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function flat(): BelongsTo
    {
        return $this->belongsTo(Flat::class);
    }

    public function tenantProfile(): BelongsTo
    {
        return $this->belongsTo(TenantProfile::class);
    }

    public function securityGuard(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guard_id');
    }
}
