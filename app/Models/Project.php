<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ModelTrait;

class Project extends Model
{
    use ModelTrait;

    const ACTIVE_STATUS = '1';
    const CLOSED_STATUS = '5';
    const ARCHIVED_STATUS = '9';
    const IS_PUBLIC = '1';

    protected $hidden = [
        'parent_id'
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public $timestamps = false;

    protected $guarded = ['id'];

    protected $dates = [
        'created_on',
        'updated_on',
    ];

    /**
     * Project trackers
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function trackers()
    {
        return $this->belongsToMany(Tracker::class, ProjectsTracker::getTableName());
    }

    public function versions()
    {
        return $this->hasMany(Version::class);
    }

    public function enumerations()
    {
        return $this->hasMany(Enumeration::class);
    }

    public function enabledModules()
    {
        return $this->hasMany(EnabledModule::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, Member::getTableName());
    }
}
