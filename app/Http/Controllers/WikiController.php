<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WikiPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WikiController extends Controller
{
    protected function getWikiPageMarkDown($identifier, $page_title = null)
    {
        $user_projects = Auth::user()->projects;

        $project = $user_projects->where('identifier', $identifier)->first();

        if (is_null($project)) {
            abort(403);
        }

        $wiki_content = $project->wiki
            ->page()
            ->with('content');

        if ($page_title) {
            $wiki_content->where('title', $page_title);
        } else {
            $wiki_content->where('parent_id', null);
        }

        $wiki_content = $wiki_content->first()->toArray();

        return response()->json(array_merge(is_null($wiki_content['content']) ? [] : $wiki_content['content'] , ['title' => $wiki_content['title']]));
    }

    protected function setWikiPageMarkDown(Request $request, $project_identifier, $wiki_id, $name = null)
    {
        $user_projects = Auth::user()->projects;
        $project = $user_projects->where('identifier', $project_identifier)->first();

        if (is_null($project)) {
            abort(403);
        }

        $wiki_content = $project->wiki->page();

        if ($name) {
            $wiki_content->where('title', $wiki_id);
            $wiki_id = $name;
        } else {
            $wiki_content->where('id', $wiki_id);
        }

        $wiki_content = $wiki_content
            ->with(['content' => function ($q) use($wiki_id) {
                $q->where('id', $wiki_id);
            }])
            ->firstOrFail();
        $wiki_content->content->update([
            'text' => $request->input('text')
        ]);

        $wiki_content = $wiki_content->toArray();

        return response()->json(array_merge($wiki_content['content'], ['title' => $wiki_content['title']]));
    }

    protected function addNewWiki(Request $request, $project_identifier)
    {
        $project = Auth::user()->projects()->where('identifier', $project_identifier)->firstOrFail();
        $wiki = $project->wiki;

        $this->validate($request, [
            'title' => [
                'required',
                Rule::unique((new WikiPage())->getTable(), 'title')->where('wiki_id', $wiki->id)
            ],
            'text' => 'required|string'
        ], []);

        $new_page = $wiki->page()->create([
            'title' => $request->input('title'),
            'parent_id' => $wiki->page->first()->id
        ]);

        $new_page_content = $new_page->content()->create([
            'author_id' => Auth::user()->id,
            'text' => $request->input('text'),
            'version' => 1
        ]);

        return response()->json(array_merge($new_page_content->toArray(), ['title' => $new_page->title]), 201);
    }

    protected function getAllWikiPage(Request $request, $project_identifier)
    {
        $project = Auth::user()->projects()->where('identifier', $project_identifier)->firstOrFail();

        $wiki = $project->wiki->page()->with('content')->get();

        return $wiki;
    }

    public function getNews($identifier) {

        return Project::getNewsByProjectIdentifier($identifier);

    }
}
