import ControllerBase from 'base/controller.base';
import _ from 'lodash';

/**
 * @property {UsersService} UsersService
 * @property {$rootScope} $rootScope
 * @property {$mdToast} $mdToast
 */
export default class MyMailsController extends ControllerBase {

    static get $inject() {
        return ['usersService', '$rootScope', '$mdToast'];
    }

    $onInit() {
        this.emails = _.keyBy(this.additional_emails, 'id');
        this.addEmailForm = {};
        this.errors = {};
    }

    load() {
        this.usersService.getAdditionalEmails().then((responce) => {
            this.emails = _.keyBy(responce.data, 'id');
        });

        this.newEmail = null;
    }


    updateEmailAddress(id) {
        this.usersService.updateAdditionalEmail(id, {notify: this.emails[id].notify}).then(() => {
            this.load();
        });
    }

    deleteEmailAddress(id) {
        this.usersService.deleteAdditionalEmail(id).then(() => {
            this.load();
        });
    }

    addEmailAddress() {
        this.usersService.addAdditionalEmail(this.newEmail).then(() => {
            this.load();
        }).catch((response) => this.onError(response));
    }

    onError(response) {
        if (_.get(response, 'status') === 500) {
            this.$mdToast.show(
                this.$mdToast.simple().textContent('Server error')
            );
        } else {
            this.errors = _.get(response, 'data.errors', {});
            for (let field in this.errors) {
                if (this.addEmailForm.hasOwnProperty(field)) {
                    this.addEmailForm[field].$setValidity('server', false);
                }
            }
        }
    }

    change(field) {
        if (this.addEmailForm.hasOwnProperty(field) && this.errors.hasOwnProperty(field)) {
            this.addEmailForm[field].$setValidity('server', true);
            this.addEmailForm[field] = undefined;
        }
    }

}