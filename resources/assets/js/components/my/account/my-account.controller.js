import angular from 'angular';
import PasswordTemplate from '../change-password/my-change-password.html';
import mainChangePasswordController from '../change-password/my-change-password.controller';


export default class mainMyAccountIndexController {
    static get $inject() {
        return ['$injector'];
    }

    constructor($injector) {
        this.$auth = $injector.get('$auth');
        this.$state = $injector.get('$state');
        this.toaster = $injector.get('$mdToast');
        this._mdPanel = $injector.get('$mdPanel');
        this.UserSevice = $injector.get('UsersService');

        this.user = this.UserSevice.getUserInfo();
        this.languages = this.UserSevice.getLanguage();

        this.element = angular.element(document.body);
    }

    changePassword() {
        let position = this._mdPanel.newPanelPosition()
            .absolute()
            .left()
            .top();

        let animation = this._mdPanel.newPanelAnimation();
        animation.duration(300);
        animation.openFrom('.animation-target');
        animation.withAnimation(this._mdPanel.animation.SCALE);

        let config = {
            animation: animation,
            attachTo: this.element,
            controller: mainChangePasswordController,
            controllerAs: '$ctrl',
            template: PasswordTemplate,
            panelClass: 'change-password-dialog',
            position: position,
            trapFocus: true,
            clickOutsideToClose: true,
            clickEscapeToClose: true,
            hasBackdrop: true,
        };

        this._mdPanel.open(config);
    }

}