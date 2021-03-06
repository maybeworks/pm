<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Class User
 *
 * @property string $login
 * @property string $hashed_password
 * @property string $firstname
 * @property string $lastname
 * @property string $last_login_on
 * @property string $language
 * @property string $created_on
 * @property string $updated_on
 * @property string $identity_url
 * @property string $type
 * @property string $mail_notification
 * @property string $salt
 * @property string $passwd_changed_on
 * @property string $avatar_hash
 * @property bool $admin
 * @property bool $must_change_passwd
 * @property int $id
 * @property int $status
 * @property int $auth_source_id
 *
 * @package App\Models
 */
class User extends Authenticatable
{
    use ModelTrait;

    const STATUS_ACTIVE = 1;
    const STATUS_DISABLE = 2;
    const STATUS_LOCK = 3;

    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'updated_on';

    const TYPE_USER = 'User';
    const TYPE_GROUP = 'GROUP';
    const TYPE_ANONYMOUS_USER = 'AnonymousUser';
    const TYPE_GROUP_ANONYMOUS = 'GroupAnonymous';
    const TYPE_GROUP_NON_MEMBER = 'GroupNonMember';
    const TYPE_GROUP_BOTS = 'GroupBots';

    // todo: rewrite to constants
    public static $NOTIFICATIONS = [
        ['value' => 'all', 'name' => 'For any event on all my projects'],
        ['value' => 'selected', 'name' => 'For any event on the selected projects only...'],
        ['value' => 'only_my_events', 'name' => 'Only for things I watch or I\'m involved in'],
        ['value' => 'only_assigned', 'name' => 'Only for things I am assigned to'],
        ['value' => 'only_owner', 'name' => 'Only for things I am the owner of'],
        ['value' => 'none', 'name' => 'No events']
    ];

    protected $attributes = [
        'type' => User::TYPE_USER,
        'mail_notification' => 'only_my_events',
        'admin' => 0,
        'status' => User::STATUS_DISABLE,
        'must_change_passwd' => 0,
    ];

//    public $timestamps = true;

    protected $guarded = ['id'];

    protected $casts = [
        'admin' => 'boolean',
    ];

    protected $dates = [
        'created_on',
        'updated_on',
        'last_login_on',
    ];

    public function emails()
    {
        return $this->hasMany(EmailAddress::class);
    }

    public function preference()
    {
        return $this->hasOne(UserPreference::class);
    }

    public function tokens()
    {
        return $this->hasMany(Token::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'author_id', 'id');
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, Member::getTableName());
    }

    public function groups()
    {
        return $this->belongsToMany(User::class, GroupsUser::getTableName(), 'user_id', 'group_id');
    }
}
