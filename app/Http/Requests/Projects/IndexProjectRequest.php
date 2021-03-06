<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class IndexProjectRequest extends FormRequest
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
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'public' => 'array',
            'public.*' => 'integer|in:1,0',
            'status_ids' => 'array',
            // todo: status_ids depends on user admin status
            // todo: check for exists
            'status_ids.*' => 'integer|in:1,5,9',
            'order' => 'string',
            'per_page' => 'integer',
            'page' => 'integer',
        ];
    }
}
