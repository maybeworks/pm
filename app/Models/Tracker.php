<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Tracker
 *
 * @property int $id
 * @property int $position
 * @property int $fields_bits
 * @property int $default_status_id
 * @property string $name
 * @property bool $is_in_chlog
 * @property bool $is_in_roadmap
 *
 * @package App\Models
 */
class Tracker extends Model
{
    use ModelTrait;
    
    public $timestamps = false;

    protected $guarded = ['id'];

    public function projects()
    {
        return $this->belongsToMany(Project::class, ProjectsTracker::getTableName());
    }
}
