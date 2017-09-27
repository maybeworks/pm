<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\AuthLoginRequest;
use App\Http\Requests\Auth\AuthRegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordSendTokenRequest;
use App\Services\AuthService;
use App\Services\UsersService;
use Illuminate\Routing\Controller as BaseController;

class AuthController extends BaseController
{
    /**
     * @var AuthService
     */
    protected $authService;

    /**
     * @var UsersService
     */
    protected $usersService;

    public function __construct(
        AuthService $authService,
        UsersService $usersService
    )
    {
        $this->authService = $authService;
        $this->usersService = $usersService;
    }

    /**
     * Authorization user in system
     *
     * @url protocol://ip:port/api/v1/auth
     *
     * @example {
     *     "login": "user email" or "login",
     *     "password": "user password"
     * }
     *
     * @param AuthLoginRequest $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\JsonResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function login(AuthLoginRequest $request)
    {
        $token = $this->authService->session($request->input('login'));

        return response()->json(['token' => $token->value]);
    }

    /**
     * Register user
     *
     * This method create user and user relationships
     *
     * @url protocol://ip:port/api/v1/register
     *
     * @example Request $request {
     *     "firstName": "test",
     *     "lastName": "test",
     *     "login": "dev",
     *     "email": "test@mail.ua",
     *     "password": "qwerty",
     *     "repeatPassword": "qwerty",
     *     "lang": "ru",
     *     "hideEmail": "0"
     *}
     *
     * @param AuthRegisterRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(AuthRegisterRequest $request)
    {
        $this->usersService->register($request->all());

        return response(null, 201);
    }

    public function sendResetPasswordToken(ResetPasswordSendTokenRequest $request)
    {
        $token = $this->authService->sendResetPasswordToken($request->input('email'));

        return response()->json(['reset_password_token' => $token->value]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $this->authService->resetPassword($request->all());

        return response(null, 200);
    }
}