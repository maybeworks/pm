<?php

namespace App\Http\Requests\Wiki;

use App\Models\WikiPage;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWikiPageRequest extends FormRequest
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
            'text' => 'nullable|string',
            // todo: check parent_id and relation parent to project
            'parent_id' => 'nullable|int|exists:' . WikiPage::getTableName() . ',id',
            'comments' => 'nullable|string'
        ];
    }
}
