<?php

use Illuminate\Http\Request;

/**
 * Route group
 *
 * This route group contains the routes api version 1
 */
Route::group(
    [
        'prefix' => 'v1'
    ],
    function () {
        Route::group([],
            function () {
                Route::post('auth', 'AuthController@login');
                Route::post('register', 'AuthController@register');
                Route::post('password-reset', 'AuthController@sendResetPasswordToken');
                Route::put('password-reset', 'AuthController@resetPassword');
            }
        );

        Route::group(
            [
                'middleware' => 'auth',
                'prefix' => 'my'
            ],
            function () {
                Route::get('account', 'AccountController@show');
                Route::put('account', 'AccountController@update');
                Route::put('password', 'AccountController@changePassword');
                Route::get('api-key', 'AccountController@showApiKey');
                Route::put('api-key', 'AccountController@resetApiKey');
                Route::put('rss-key', 'AccountController@resetAtomKey');
            }
        );

        Route::group(
            [
                'middleware' => 'auth',
                'prefix' => 'projects'

            ],
            function () {
                Route::get('/', 'ProjectsController@index');
                Route::get('/{identifier}', 'ProjectsController@show');
                Route::post('/', 'ProjectsController@create');
                Route::put('/{identifier}', 'ProjectsController@update');
                Route::delete('/{identifier}', 'ProjectsController@destroy');
                Route::get('/{identifier}/issues', 'ProjectsController@getIssues');

                Route::get('/{identifier}/news', 'NewsController@getProjectNews');
                Route::put('/{identifier}/wiki/{id}', 'WikiController@setWikiPageMarkDown');
                Route::get('/{identifier}/wiki', 'WikiController@getWikiPageMarkDown');
                Route::get('/{identifier}/wiki/all', 'WikiController@getAllWikiPage');
                Route::post('/{identifier}/new-page', 'WikiController@addNewWiki');
                Route::get('/{identifier}/wiki/{page_title}', 'WikiController@getWikiPageMarkDown');
                Route::put('/{identifier}/wiki/{name}/{id}', 'WikiController@setWikiPageMarkDown');

                Route::get('/{projectId}/attachments', 'AttachmentController@index');

            }
        );

        Route::group(
            [
                'middleware' => 'auth',
                'prefix' => 'news'

            ],
            function () {
                Route::get('/', 'NewsController@index');
                Route::get('/{id}', 'NewsController@show');
            }
        );

        Route::group(
            [
                'middleware' => 'auth',
                'prefix' => 'issues'

            ],
            function () {
                Route::get('/{id}', 'IssuesController@getIssue');
                Route::get('/', 'IssuesController@getIssues');
                Route::post('/{id}/update', 'IssuesController@postUpdate');
                Route::get('/{id}/infoedit/{project_id}', 'IssuesController@infoEdit');
            }
        );

        Route::group(
            [
                'middleware' => 'auth',
                'prefix' => 'users'

            ],
            function () {

            }
        );
    }
);