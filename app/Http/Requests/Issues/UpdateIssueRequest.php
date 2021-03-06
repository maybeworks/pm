<?php

namespace App\Http\Requests\Issues;

use App\Models\Enumeration;
use App\Models\Issue;
use App\Models\IssueStatus;
use App\Models\Project;
use App\Models\Tracker;
use Illuminate\Validation\Rule;

class UpdateIssueRequest extends CreateIssueRequest
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
        // todo: remove dublicated rules
        return array_merge(
            parent::rules(),
            [
                'subject' => 'string',
                'priority_id' => [
//                    'required',
                    'int',
                    Rule::exists(Enumeration::getTableName(), 'id')
                        ->where('type', Issue::ENUMERATION_PRIORITY)
                ],
                'is_private' => 'boolean',
                'project_identifier' => 'string|exists:' . Project::getTableName() . ',identifier',
                'tracker_id' => 'int|exists:' . Tracker::getTableName() . ',id',
                'status_id' => 'int|exists:' . IssueStatus::getTableName() . ',id',

                'notes' => 'nullable|string',
                'private_notes' => 'boolean',
            ]
        );
    }
}