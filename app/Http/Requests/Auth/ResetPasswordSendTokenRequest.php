<?php

namespace App\Http\Requests\Auth;


use App\Models\EmailAddress;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordSendTokenRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Gets the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'email' => 'required|string|email|max:255|exists:' . EmailAddress::getTableName() . ',address'
        ];
    }
}