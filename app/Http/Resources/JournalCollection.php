<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class JournalCollection extends ResourceCollection
{
    public function toArray($request)
    {
        // remove journal item if is private and empty details
        return JournalResource::collection(
            $this->collection->reject(function ($journal) {
                // todo: private notes show by user roles settings or for admin
                return $journal->private_notes && $journal->user_id !== \Auth::id() && empty($journal->details);
            })
        );
    }

}
