<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemUpdate extends Model
{
    protected $fillable = [
        'version',
        'title',
        'description',
        'changelog',
        'release_date',
        'is_critical',
        'applied_to',
    ];

    protected $casts = [
        'release_date' => 'date',
        'is_critical' => 'boolean',
        'applied_to' => 'array',
    ];

    public function isAppliedTo($clientId)
    {
        return in_array($clientId, $this->applied_to ?? []);
    }

    public function markAsApplied($clientId)
    {
        $applied = $this->applied_to ?? [];
        if (! in_array($clientId, $applied)) {
            $applied[] = $clientId;
            $this->update(['applied_to' => $applied]);
        }
    }
}
