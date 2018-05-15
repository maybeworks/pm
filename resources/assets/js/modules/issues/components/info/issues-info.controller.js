import ControllerBase from 'base/controller.base';

/**
 * @property {$state} $state
 * @property {IssuesService} issuesService
 * @property {$stateParams} $stateParams
 * @property {$rootScope} $rootScope
 * @property {ProjectsService} projectsService
 */
export default class IssuesInfoController extends ControllerBase {

    static get $inject() {
        return ['issuesService', '$stateParams', '$rootScope', 'projectsService', '$state'];
    }

    $onInit() {
        // todo: show parent issue info
        // todo: show crated/updated info
        // todo: markdown for h1-h5 tags
        this.load();
        this.$rootScope.$on('deldeteIssues', () => this.$state.go('issues-inner.list', {project_id: this.projectsService.getCurrentId()}));
    }

    load() {
        this.loadProccess = true;
        this.issuesService
            .one(this.$stateParams.id)
            .then((response) => {
                this.issue = response.data.data;
                this.projectsService.setCurrentId(this.issue.project.identifier);
                this.$rootScope.$emit('updateProjectInfo');
                this.loadProccess = false;
            });
    }

    // openList() {
    //     this.$state.go('issues-inner.list', {project_id: this.projectsService.getCurrentId()});
    // }
    //
    // openImports() {
    //     this.$state.go('issues.imports');
    // }
    //
    // openReport() {
    //     this.$state.go('issues-inner.report', {project_id: this.projectsService.getCurrentId()});
    // }

}