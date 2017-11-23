import ControllerBase from 'base/controller.base';
// import _ from 'lodash';

/**
 * @property identifier
 * @property memberId
 *
 * @property {$mdDialog} $mdDialog
 * @property {ProjectsService} ProjectsService
 * @property {$rootScope} $rootScope
 * @property {RolesService} RolesService
 */
export default class ProjectsMemberController extends ControllerBase {

    static get $inject() {
        return ['$mdToast', '$q', '$mdDialog', 'ProjectsService', '$rootScope', 'RolesService', 'UsersService'];
    }

    $onInit() {
        // if project identifier not set - close dialog
        if (!this.identifier) {
            this.cancel();
        }

        this.member = this.member || {id: null, roleId: null, userId: null, name: null};

        // user roles list
        this.RolesService
            .getList({
                builtin: 0
            })
            .then((response) => {
                this.roles = response.data;
            });

        // if add new member - load users list with out project members
        if (!this.member.id) {
            this.$q.all([
                this.UsersService.getList(),
                this.ProjectsService.one(this.identifier)
            ]).then((response) => {
                let users = response[0].data,
                    members = response[1].data.members;

                this.users = users.filter((user) => {
                    return !members.some((member) => {
                        return member.user_id === user.id;
                    });
                });
            });
        }
    }

    cancel(update) {
        this.$mdDialog.cancel();

        if (update) {
            this.$mdToast.show(
                this.$mdToast.simple().textContent('Success saved!').position('bottom left')
            );
            this.$rootScope.$emit('updateProjectInfo');
        }
    }

    submit() {
        if (!this.member.id) {
            this.ProjectsService
                .createMember(this.identifier, this.member.userId, this.member.roleId)
                .then(() => this.cancel(true));
        } else {
            this.ProjectsService
                .updateMember(this.member.id, this.member.roleId)
                .then(() => this.cancel(true));
        }
    }

}
