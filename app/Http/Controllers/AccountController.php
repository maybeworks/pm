<?php

namespace App\Http\Controllers;


//use App\Http\Requests\ChangePasswordRequest;
//use App\Http\Requests\UpdateRequest;
//use App\Services\AccountService;
//use App\Services\EmailAddressesService;
//use App\Services\TokenService;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Services\UsersService;
//use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;


/**
 * Class AccountController
 *
 * @property TokenService $tokenService
 * @property UsersService $usersService
 * @property EmailAddressesService $emailAddressesService
 *
 */
class AccountController extends BaseController
{

    protected $usersService;
//    protected $emailAddressesService;
//    protected $tokenService;

    public function __construct(
        UsersService $usersService
//        EmailAddressesService $emailAddressesService,
//        TokenService $tokenService
    )
    {
        $this->usersService = $usersService;
//        $this->emailAddressesService = $emailAddressesService;
//        $this->tokenService = $tokenService;
    }

    public function show()
    {
        return AccountResource::make(
            $this->usersService->one(
                \Auth::id(),
                ['emails', 'preference', 'tokens']
            )
        );
    }

    public function update(UpdateAccountRequest $request)
    {
        $user = $this->usersService->update(
            \Auth::id(),
            $request->validated()
        );

        if (!$user) {
            abort(422);
        }

        return AccountResource::make($user);
    }

//    public function update($id, UpdateRequest $request)
//    {
//        $result = $this->usersService->update($id, $request->except('tokens', 'avatar_hash','members','issues','projects'));
//        return response((string)$result, 200);
//    }
//
//    public function changePassword(ChangePasswordRequest $request)
//    {
//        $result = $this->usersService->changePassword($request->all());
//        return response((string)$result, 200);
//    }

//    public function showApiKey()
//    {
//        return response([
//            'token' => $this->tokenService->getApiKey(Auth::user())
//        ], 200);
//    }

//    public function resetApiKey()
//    {
//        $token = $this->tokenService->resetApiKey(Auth::user())->toArray();
//
//        return response([
//            'updated_on' => $token['updated_on'],
//            'value' => $token['value']
//        ], 200);
//    }

//    public function resetAtomKey()
//    {
//        return response([
//            'updated_on' => $this->tokenService->resetAtomKey(Auth::user())->toArray()['updated_on']
//        ], 200);
//    }
//
//    public function updateAdditionalEmail($id, Request $request)
//    {
//        $result = $this->emailAddressesService->updateById($id, $request->all());
//        return response()->json($result, 200);
//    }

//    public function deleteAdditionalEmail($id)
//    {
//        $result = $this->emailAddressesService->deleteById($id);
//        return response()->json($result, 200);
//    }
//
//    public function getAdditionalEmails()
//    {
//        $result = $this->emailAddressesService->getList([
//            'user_id' => Auth::user()->id,
//            'is_default' => false
//        ]);
//        return response()->json($result, 200);
//    }
//
//    public function addAdditionalEmails(Request $request)
//    {
//        $result = $this->emailAddressesService->create(Auth::user(), $request->all());
//        return response()->json($result, 200);
//    }
}