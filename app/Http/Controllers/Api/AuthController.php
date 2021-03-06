<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\AuthLoginRequest;
use App\Http\Requests\Auth\AuthRegisterRequest;
use App\Http\Resources\TokenResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use App\Services\SettingsService;
use App\Services\UsersService;
use Illuminate\Routing\Controller as BaseController;

class AuthController extends BaseController
{
    protected $settingsService;
    protected $authService;
    protected $usersService;

    public function __construct(
        SettingsService $settingsService,
        AuthService $authService,
        UsersService $usersService
    )
    {
        $this->settingsService = $settingsService;
        $this->authService = $authService;
        $this->usersService = $usersService;
    }

    public function login(AuthLoginRequest $request)
    {
        if (!$user = $this->usersService->byLogin($request->input('login'))){
            abort(422);
        }

        if ($user->status === User::STATUS_DISABLE){
            abort(422,'Your account was created and is now pending administrator approval.');
        }

        if (!$user->status || $user->status === User::STATUS_LOCK){
            abort(422,'Your account is locked.');
        }

        if (!$token = $this->authService->session($user->id)) {
            abort(422);
        }

        \Auth::setUser($user);

        // todo: add remember token

        return TokenResource::make($token);
    }

    public function register(AuthRegisterRequest $request)
    {
        $selfRegistration = (int)$this->settingsService->get('self_registration');
        if (!$selfRegistration) {
            abort(401);
        }

        if (!$user = $this->usersService->create(array_merge($request->validated(), ['status' => User::STATUS_DISABLE]))) {
            abort(422);
        }

        switch ($selfRegistration) {
            // todo: manual activation logic
            // todo: auto activation account
//            case 0:
            // disabled
//                break;
            case 1:
                // account activation by email
                return response(
                    [
                        'message' => 'Account was successfully created. An email containing the instructions to activate your account was sent to <email>.'
                    ],
                    200
                );
                break;
            case 2:
                // manual account activation
                return response(
                    [
                        'message' => 'Your account was created and is now pending administrator approval.'
                    ],
                    200
                );
                break;
            case 3:
                // automatic account activation
                if (!$token = $this->authService->session($user->login)) {
                    abort(422);
                }

                return TokenResource::make($token);
                break;
        }

        return response(null, 201);
    }

    public function me()
    {
        if (\Auth::guest()) {
            abort(422);
        }

        return UserResource::make(\Auth::user());
    }

//    public function sendResetPasswordToken(ResetPasswordSendTokenRequest $request)
//    {
//        $token = $this->authService->sendResetPasswordToken($request->input('email'));
//
//        return response()->json(['reset_password_token' => $token->value]);
//    }
//
//    public function resetPassword(ResetPasswordRequest $request)
//    {
//        $this->authService->resetPassword($request->all());
//
//        return response(null, 200);
//    }
}