<?php

namespace App\Services;


use App\Models\Token;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

/**
 * Class UsersService
 *
 * @property EmailAddressesService $emailAddressesService
 * @property UserPreferenceService $preferenceService
 *
 * @package App\Services
 */
class UsersService
{
    protected $emailAddressesService;
    protected $preferenceService;

    public function __construct(
        EmailAddressesService $emailAddressesService,
        UserPreferenceService $preferenceService
    )
    {
        $this->emailAddressesService = $emailAddressesService;
        $this->preferenceService = $preferenceService;
    }

    public function register(array $data)
    {
        $salt = str_random(33);

        $user = User::create([
            'login' => array_get($data, 'login'),
            'firstname' => array_get($data, 'firstName'),
            'lastname' => array_get($data, 'lastName'),
            'language' => array_get($data, 'lang'),
            'salt' => $salt,
            'hashed_password' => sha1($salt . sha1(array_get($data, 'password'))),
            'mail_notification' => 'only_my_events'
        ]);

        $this->emailAddressesService->create($user, $data);
        $this->preferenceService->create($user, $data);

        return $user;
    }

    public function userByLoginOrEmail(string $login)
    {
        return User::where('login', $login)
            ->orWhereHas('email', function ($q) use ($login) {
                $q->where('address', $login);
            })
            ->first();
    }

    public function userByToken(string $token, string $action)
    {
        return User::whereHas('tokens', function ($q) use ($token, $action) {
            $q->where('action', $action)
                ->where('value', $token);
        })->first();
    }

    public function preparePassword(User $user, $password): string
    {
        return sha1($user->salt . sha1($password));
    }

    public function resetPassword(User $user, $new_password): bool
    {
        $user->hashed_password = $this->preparePassword($user, $new_password);

        return $user->save();
    }

    /**
     * Get users list
     *
     * @param array $params
     * @return mixed
     */
    public function getList($params = [])
    {
        $users = User::orderBy('firstname')->where('firstname', '!=', '');
        if (isset($params['ids'])) {
            $users = $users->whereIn('id', $params['ids']);
            unset($params['ids']);
        }

        !empty($params) ? $users = $users->where($params) : null;

        return $users->get();
    }

    /**
     * @param $id
     * @param array $with
     * @return mixed
     */
    public function getById($id, $with = [])
    {
        return User::where('id', $id)->with($with)->first();
    }

    public function update($id, $data)
    {
        if (isset($data['email'])) {
            $mainEmail = $this->emailAddressesService->getList(['user_id' => $id, 'is_default' => true])->first();
            $this->emailAddressesService->update($mainEmail, ['address' => $data['email']]);
            unset($data['email']);
        }

        $userPreferencesData = [];
        $userPreferencesFields = [
            'comments_sorting',
            'no_self_notified',
            'warn_on_leaving_unsaved',
            'time_zone',
            'hide_mail'
        ];

        foreach ($userPreferencesFields as $field) {
            if (isset($data[$field])) {
                $userPreferencesData[$field] = $data[$field];
                unset($data[$field]);
            }
        }
        unset($userPreferencesFields);

        if (!empty($userPreferencesData)) {
            $this->preferenceService->updateByUserId($id, $userPreferencesData);
        }

        unset($data['id']);

        return User::where(['id' => $id])->first()->update($data);
    }

    public function changePassword(array $data)
    {
        $user = Auth::user();
        $this->resetPassword($user, $data['new_password']);

        return $user->update(['passwd_changed_on' => date('Y-m-d H:i:s')]);
    }


}