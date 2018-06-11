import ControllerBase from 'base/controller.base';
import IssuesCategoryController from "../category/issues-category.controller";
import issuesCategoryTemplate from "../category/issues-category.html";

/**
 */
export default class IssuesProjectSettingsController extends ControllerBase {

    static get $inject() {
        return ['$rootScope', '$mdDialog', 'issuesService', 'projectsService'];
    }

    $onInit() {
        this.categories = [];
        this.load();
        this.updateIssuesCategories = this.$rootScope.$on('updateIssuesCategories', () => this.load());
    }

    $onDestroy() {
        this.updateIssuesCategories();
    }

    load() {
        this.issuesService
            .categories(this.projectsService.getCurrentId())
            .then((response) => {
                this.categories = response.data.data;
            });
    }

    static setMdDialogConfig(target, data = {}) {
        return {
            controller: IssuesCategoryController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: data,
            template: issuesCategoryTemplate,
            clickOutsideToClose: true,
            openFrom: target,
            closeTo: target,
        };
    }

    create($event) {
        this.$mdDialog.show(
            this.constructor.setMdDialogConfig($event.target, {
                project: this.params
            })
        );
    }

    edit($event, item) {
        this.$mdDialog.show(
            this.constructor.setMdDialogConfig($event.target, {
                project: this.params,
                category: item
            })
        );
    }

    remove(item) {
        let confirm = this.$mdDialog.confirm()
            .title('Do you want to delete "' + item.name + '" issue category?')
            .ok('Delete')
            .cancel('Cancel');

        this.$mdDialog
            .show(confirm)
            .then(() => this.issuesService.removeCatrgory(item.id))
            .then(() => {
                this.$rootScope.$emit('updateIssuesCategories');
                this.$mdToast.show(
                    this.$mdToast.simple().textContent('Success delete!').position('bottom left')
                );
            });
    }

}