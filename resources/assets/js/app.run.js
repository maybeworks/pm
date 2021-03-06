import _ from 'lodash';
import InjectableBase from 'base/injectable.base';

/**
 * Class AppRun
 */
export default class AppRun extends InjectableBase {

    static get $inject() {
        return ['$rootScope', '$transitions', '$mdToast', '$state', '$http', 'authService','$q'];
    }

    $onInit() {
        // this.isReady = false;
        window.Promise = this.$q;

        // todo: reset document scroll position after change state

        this.$transitions.onStart({}, (...args) => this.checkAccess(...args));
        this.$rootScope.$on('authUnauthorized', (...args) => this.authUnauthorized(...args));
        this.$rootScope.$on('authForbidden', (...args) => this.authForbidden(...args));
        this.$rootScope.$on('notFound', (...args) => this.notFound(...args));
        this.$rootScope.$on('notAllowed', (...args) => this.notAllowed(...args));
        this.$rootScope.$on('serverError', (...args) => this.serverError(...args));
        this.$rootScope.$on('tooManyRequests', (...args) => this.tooManyRequests(...args));
        // this.Restangular.setErrorInterceptor((...args) => this.errorInterceptor(...args));
    }

    async checkAccess(trans) {
        // todo: if set "must_change_passwd" for current user - redirect to change password page
        // console.log(trans.router.stateService.href(trans.to(), trans.params(),{absolute: true}));
        const access = _.get(trans.$to(), 'data.access', false);

        if (access) {
            await this.authService.me();

            // Cancel going to the authenticated state and go back to landing
            if (access === '@' && !this.authService.isAuthenticated()) {
                return trans.router.stateService.target('login');
            }

            // if controller not require authorizing and has deny signed users flag then redirect
            if (access === '?' && this.authService.isAuthenticated()) {
                return trans.router.stateService.target('home');
            }

            // check admin access
            if (access === '!' && (!this.authService.isAuthenticated() || !this.authService.isAdmin())) {
                return trans.router.stateService.target('home');
            }
        }
    }

    authUnauthorized() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Unauthorized')
        );

        this.authService.logout();
        this.$state.go('login');
    }

    authForbidden() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Forbidden')
        );

        this.$state.go('home');
    }

    notFound() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Not found')
        );

        this.$state.go('404');
    }

    notAllowed() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Method Not Allowed')
        );
    }

    tooManyRequests() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Too Many Requests!')
        );
    }

    serverError() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Server error!')
        );

        // todo: go to "500" page?
        // this.$state.go('500');
    }

    // errorInterceptor(response, deferred, responseHandler) {
    //     switch (true) {
    //         case (response.status === 401):
    //             this.$rootScope.$broadcast('authUnauthorized');
    //             break;
    //
    //         case (response.status === 403):
    //             this.$rootScope.$broadcast('authForbidden');
    //             break;
    //
    //         case (response.status === 404):
    //             this.$rootScope.$broadcast('notFound');
    //             break;
    //
    //         case (response.status >= 500):
    //             this.$mdToast.show(
    //                 this.$mdToast.simple().textContent('Server error!')
    //             );
    //     }
    // }

}