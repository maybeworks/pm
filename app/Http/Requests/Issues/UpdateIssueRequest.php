<?php

namespace App\Http\Requests\Issues;


use App\Models\Enumeration;
use App\Models\IssueStatus;
use App\Models\User;
use App\Models\Project;
use App\Models\Tracker;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIssueRequest extends FormRequest
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
            'assigned_to_id' => 'required|int|exists:' . User::getTableName() . ',id',
            'category_id' => 'int|nullable',
            'due_date' => 'date|nullable|after_or_equal:start_date',
            'estimated_hours' => 'numeric|nullable',
            'start_date' => 'date|nullable',
//			'subject' => 'required|numeric',
            'subject' => 'required|string',
            'description' => 'string|nullable',
            'priority_id' => 'required|int|exists:' . Enumeration::getTableName() . ',id',
//			'is_private' => 'boolean',
            'project_identifier' => 'required|string|exists:' . Project::getTableName() . ',identifier',
            'tracker_id' => 'required|int|exists:' . Tracker::getTableName() . ',id',
            'status_id' => 'required|int|exists:' . IssueStatus::getTableName() . ',id'
        ];
    }
}