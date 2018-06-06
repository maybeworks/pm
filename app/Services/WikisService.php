<?php

namespace App\Services;

use App\Models\Wiki;
use App\Models\WikiPage;

class WikisService
{

    public function allPages($projectId)
    {
        return WikiPage::query()
            ->with([
//                'childs',
                'content.author'
            ])
            ->whereHas('wiki', function ($query) use ($projectId) {
                /** @var $query \Illuminate\Database\Eloquent\Builder */
                $query->where('project_id', $projectId);
            })
//            ->where(['parent_id' => null])
            ->get()
            ->map(function ($page) {
                $current = $page;
                $parents_ids = [];

                while ($current->parent) {
                    $parents_ids[] = $current->parent->id;
                    $current = $current->parent;
                }

                $page->parents_ids = $parents_ids;

                return $page;
            });
    }

    public function onePageById($id)
    {
        return WikiPage::query()
            ->with([
                'watchers',
                'content.author'
            ])
            ->where(['id' => $id])
            ->first();
    }

    public function onePageByName($projectId, $name, $orNew = false)
    {
        return WikiPage::query()
                ->with([
                    'watchers',
                    'content.author'
                ])
                ->where(['title' => $name])
                ->whereHas('wiki', function ($query) use ($projectId) {
                    /** @var $query \Illuminate\Database\Eloquent\Builder */
                    $query->where('project_id', $projectId);
                })
                ->first() ?? ($orNew ? new WikiPage(['title' => $name]) : null);
    }

    public function oneWikiById($id, array $with = [], $orNew = false)
    {
        return Wiki::query()
                ->with($with)
                ->where(['id' => $id])
                ->first() ?? ($orNew ? new Wiki() : null);
    }

    public function oneWikiByProjectId($projectId, array $with = [], $orNew = false)
    {
        return Wiki::query()
                ->with($with)
                ->where(['project_id' => $projectId])
                ->first() ?? ($orNew ? new Wiki() : null);
    }

    public function createWiki(array $data)
    {
        if (!$wiki = $this->oneWikiByProjectId($data['project_id'])) {
            return Wiki::query()->create($data);
        }

        return $wiki;
    }

    public function updateWiki($projectId, array $data, array $with = [])
    {
        if (($wiki = $this->oneWikiByProjectId($projectId, $with)) && $wiki->update($data)) {
            return $wiki;
        }

        return false;
    }

    public function createPage(array $data)
    {
        if (($base = $this->oneWikiByProjectId($data['project_id'])) && $page = $base->pages()->create($data)) {
            /** @var $page WikiPage */
            $data['page_id'] = $page->id;
            $data['data'] = array_get($data, 'text');

            $page
                ->content()->create($data)
                ->versions()->create($data);

            return $page;
        }

        return false;
    }

    public function updatePage($projectId, $name, $data)
    {

    }

    public function watchPage($id, $userId)
    {
        /** @var $page WikiPage */
        if ($page = $this->onePageById($id)) {
            $page->watchers()->attach($userId);
            return true;
        }

        return false;
    }

    public function unwatchPage($id, $userId)
    {
        /** @var $page WikiPage */
        if ($page = $this->onePageById($id)) {
            $page->watchers()->detach($userId);
            return true;
        }

        return false;
    }

    public function lockPage($id)
    {
        /** @var $page WikiPage */
        if ($page = $this->onePageById($id)) {
            return $page->update(['protected' => true]);
        }

        return false;
    }

    public function unlockPage($id)
    {
        /** @var $page WikiPage */
        if ($page = $this->onePageById($id)) {
            return $page->update(['protected' => false]);
        }

        return false;
    }
}