mainConfig.$inject = ['$stateProvider'];

export default function mainConfig($stateProvider) {

    $stateProvider
        .state('404', {
            parent: 'blank',
            url: '/404',
            views: {
                content: {
                    component: 'main404Component',
                }
            }
        })
        .state('500', {
            parent: 'blank',
            url: '/500',
            views: {
                content: {
                    component: 'main500Component',
                }
            }
        })
        .state('home', {
            data: {
                access: '@'
            },
            parent: 'default',
            url: '/',
            views: {
                content: {
                    component: 'mainIndexComponent',
                }
            }
        })
        .state('login', {
            data: {
                access: '?',
            },
            url: '/login',
            parent: 'blank',
            views: {
                content: {
                    component: 'mainLoginComponent',
                }
            }
        })
        .state('signup', {
            data: {
                access: '?',
            },
            url: '/signup',
            parent: 'blank',
            views: {
                content: {
                    component: 'mainRegistrationComponent',
                }
            }
        })
        .state('logout', {
            url: '/logout',
            component: 'mainLogoutComponent'
        })
       .state('reset-password', {
            data: {
              access: '?',
            },
            url: '/reset-password',
            parent: 'blank',
            views: {
              content: {
                component: 'mainResetPasswordComponent',
              }
            }
        })
    ;
};
