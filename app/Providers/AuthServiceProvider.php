<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        Auth::viaRequest('db-token', function (Request $request) {
            // todo: check app settings for allow Anonymous user
            if ($token = $request->bearerToken()) {
                $service = app(\App\Services\AuthService::class);

                // todo: check expire token
                if (($result = $service->find($token)) && $result->user) {
                    return $result->user;
                }
            }

            return null;
        });

        $this->registerPolicies();
    }
}
