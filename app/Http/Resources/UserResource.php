<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\Resource;

class UserResource extends Resource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        $email = $this->emails->firstWhere('is_default', true);

        return [
            'id' => $this->id,
            // todo: nedd check system config for user fullname format
            'full_name' => $this->firstname . ' ' . $this->lastname,
//            'full_name' => $this->full_name,
            'login' => $this->login,
//            'avatar' => $this->avatar,
            // todo: need check system config for avatar src
            $this->mergeWhen($email !== null, function () use ($email) {
                return [
                    'avatar' => '//www.gravatar.com/avatar/' . md5(strtolower(trim($email->address))) . '?rating=PG&default=mp'
                ];
            }),
            $this->mergeWhen(\Auth::user() && \Auth::user()->admin, [
                'request' => $this->admin
            ]),
            $this->mergeWhen($this->type !== 'User', [
                'is_group' => true
            ]),
//            'is_group' => $this->type !== 'User',
            'created_on' => $this->created_on->format('Y-m-d H:i:s'),
            $this->mergeWhen(!empty($this->last_login_on), function () {
                return [
                    'last_login_on' => $this->last_login_on->format('Y-m-d H:i:s')
                ];
            })
        ];
    }
}
