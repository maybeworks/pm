import ControllerBase from 'base/controller.base';

/**
 * @property {$mdDialog} $mdDialog
 * @property {ProjectsService} projectsService
 * @property {$rootScope} $rootScope
 * @property {IssuesService} issuesService
 * @property {ProjectsService} projectsService
 * @property {$stateParams} $stateParams
 * @property {$state} $state
 * @property {$q} $q
 */
export default class IssuesCategoryController extends ControllerBase {

    static get $inject() {
        return ['$mdToast', '$rootScope', 'issuesService', 'projectsService', '$stateParams', '$state', '$q'];
    }

    $onInit() {
        this.errors = {};
        this.form = null;
        this.project = {};
        this.category = {
            id: this.$stateParams.id
        };
        this.title = this.category.id ? 'Issue category' : 'New category';
        this.loadProccess = false;
        this.load();
    }

    load() {
        this.loadProccess = true;

        let deferred = this.$q.defer();

        if (this.category.id) {
            this.issuesService
                .category(this.category.id)
                .then((response) => {
                    Object.assign(this.category, response.data.data);
                    this.projectsService.setCurrentId(this.category.project.identifier);
                    this.$rootScope.$emit('updateProjectInfo');
                    deferred.resolve();
                })
                .catch(() => {
                    deferred.reject();
                });
        } else {
            deferred.resolve();
        }

        deferred.promise.then(() => {
            return this.projectsService
                .one(this.projectsService.getCurrentId())
                .then((response) => {
                    Object.assign(this.project, response.data.data);
                });
        });

        deferred.promise.finally(() => {
            this.loadProccess = false;
        });

        return deferred.promise;
    }

    submit() {
        this.loadProccess = true;
        let model = {
            assigned_to_id: this.category.assigned ? this.category.assigned.id : null,
            name: this.category.name
        };

        (this.category.id ?
            this.issuesService.updateCategory(this.category.id, model) :
            this.issuesService.createCategory(this.project.identifier, model))
            .then(() => {
                // this.$rootScope.$emit('updateIssuesCategories');

                this.$mdToast.show(
                    this.$mdToast.simple().textContent('Successful update.')
                );

                this.$state.go('projects.inner.settings', {
                    page: 'categories',
                    project_id: this.projectsService.getCurrentId()
                });
            })
            .catch((response) => {
                this.errors = _.get(response, 'data.errors', {});
            })
            .finally(() => {
                this.loadProccess = false;
            });
    }
}
