<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;

/**
 * Class WikiContentVersion
 *
 * @property int $id
 * @property int $wiki_content_id
 * @property int $page_id
 * @property int $author_id
 * @property int $version
 * @property string $data
 * @property string $compression
 * @property string $comments
 * @property string $updated_on
 *
 * @package App\Models
 */
class WikiContentVersion extends Model
{
    use ModelTrait;

//    public $timestamps = false;

    protected $guarded = ['id'];

    protected $dates = [
        'updated_on',
    ];

//    protected $fillable = [
//        'author_id',
//        'data',

//    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'id', 'author_id');
    }

//    public function page()
//    {
//        return $this->belongsTo(WikiPage::class, 'id', 'page_id');
//    }

    public function content()
    {
        return $this->belongsTo(WikiContent::class);
    }
}
