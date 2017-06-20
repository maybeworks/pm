<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Issue;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class IssuesController extends Controller
{
    public function getIssues(Request $request)
    {
        $user = User::userByHeaderAuthToken($request);
        $total = 0;
        if($user->admin)
        {
            $query = Issue::join('users', 'issues.assigned_to_id', '=', 'users.id')
                ->select('issues.*', 'users.firstname as firstname', 'users.lastname as lastname', DB::raw('CONCAT(firstname, " ", lastname) AS full_name'))
                ->offset($request->offset)
                ->limit($request->limit);
            $total = $total = Issue::all()->count();
        } else{
            $query = Issue::where('assigned_to_id', $user->id)->join('users', 'issues.assigned_to_id', '=', 'users.id')
                ->select('issues.*', 'users.firstname as firstname', 'users.lastname as lastname', DB::raw('CONCAT(firstname, " ", lastname) AS full_name'))
                ->offset($request->offset)
                ->limit($request->limit);
            $total = Issue::where('assigned_to_id', $user->id)->count();
        }

        if(!empty($request->sortField))
        {
            $query->orderBy($request->sortField, $request->order);
        }
        $result = $query->get();
        return response()->json($result, 200)->header('X-Total', $total);
    }

    public function getIssue($identifier)
    {
        $result = Issue::where('issues.id', $identifier)->join('users', 'issues.assigned_to_id', '=', 'users.id')
                        ->select('issues.*', 'users.firstname as firstname', 'users.lastname as lastname')
                        ->first();

        return response()->json($result);
    }

    public function postUpdate(Request $request)
    {
        dd($request);
    }


}
