import ControllerBase from 'base/controller.base';
import _ from 'lodash';
import moment from 'moment';

/**
 * @property {IssuesService} issuesService
 * @property {$stateParams} $stateParams
 * @property {ProjectsService} projectsService
 * @property {EnumerationsService} enumerationsService
 * @property {$rootScope} $rootScope
 * @property {$q} $q
 * @property {$state} $state
 */
export default class IssuesFormController extends ControllerBase {

    static get $inject() {
        return [
            'issuesService', '$stateParams', 'projectsService', '$rootScope', '$q',
            'enumerationsService', '$mdToast', '$filter', '$state'
        ];
    }

    $onInit() {
        this.issue = {
            id: this.$stateParams.id,
            done_ratio: 0,
            project: {
                identifier: this.projectsService.getCurrentId()
            },
            watchers: []
        };

        this.categories = [];
        this.searchText = '';
        this.watchers = [];
        this.isNew = (this.$state.current.name === 'issues-inner.copy' || !this.issue.id);
        this.title = !this.isNew ? '#' : 'New issue';
        this.showDescription = this.isNew;
        // cache state for ng-if
        // this.buttonsStateCreate = !this.isNew();
        // this.loadProccess = true;
        this.load();
    }

    // isCopy() {
    //     return this.$state.current.name === 'issues-inner.copy';
    // }

    // isNew(test = 0) {
    //     console.log(test);
    //     return this.isCopy() || !this.issue.id;
    // }

    preview() {
        // todo: make preview issue
    }

    load() {
        this.loadProccess = true;
        return this.$q
            .all([
                this.projectsService.all(),
                (this.$stateParams.id ? this.issuesService.one(this.issue.id) : undefined),
                this.issuesService.statuses(),
                this.enumerationsService.all({type: 'IssuePriority'}),
            ])
            .then((response) => {
                // todo: destruct respomse array
                this.projects = _.get(response, '0.data.data');
                this.issue = Object.assign(this.issue, _.get(response, '1.data.data'));
                this.statuses = _.get(response, '2.data.data');
                this.priorities = _.get(response, '3.data.data');
                this.watchers = this.issue.watchers.map((watcher) => {
                    return {
                        user: watcher
                    }
                });

                if (!this.isNew) {
                    // todo: create title by template and check data exists
                    this.title = this.issue.tracker.name + ' #' + this.issue.id + ': ' + this.issue.subject;

                    this.projectsService.setCurrentId(this.issue.project.identifier);
                    this.$rootScope.$emit('updateProjectInfo');
                } else {
                    this.issue.id = undefined;
                    this.issue.priority_id = _.get(
                        _.find(this.priorities, 'is_default'),
                        'id'
                    );
                }

                this.loadProccess = false;
                this.changeProject();
            });
    }

    changeProject(fromSelect = false) {
        if (this.issue.project.identifier) {
            this.selectedProject = this.projects.find((project) => project.identifier === this.issue.project.identifier);
        } else {
            this.selectedProject = _.first(this.projects);
            this.issue.project.identifier = _.get(this.selectedProject, 'identifier');
        }

        if (!this.issue.id || fromSelect) {
            // todo: save tracker/state if edit/copt issue and id's exists
            this.issue.tracker_id = _.get(this.selectedProject, 'trackers.0.id');
            this.issue.status_id = _.get(this.selectedProject, 'trackers.0.default_status_id');
        }

        // todo: save/add assign user if edit issue

        if (this.selectedProject.identifier) {
            this.issuesService.categories(this.selectedProject.identifier).then((response) => {
                this.categories = response.data.data;
            });
        }
    }

    querySearch() {
        let items = _.get(this.selectedProject, 'members', [])
                .filter((e) => !this.watchers.some((watcher) => watcher.user.id === e.user.id)),
            query = this.searchText.toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((e) => e.user.full_name.toLowerCase().indexOf(query) !== -1);
    }

    submit(createAndContinue = false) {
        let model = {
            // id: 2402,
            tracker_id: this.issue.tracker_id,
            subject: this.issue.subject,
            description: this.issue.description,
            due_date: this.issue.due_date ? moment(this.issue.due_date).format('YYYY-MM-DD') : null,
            category_id: this.issue.category_id,
            status_id: this.issue.status_id,
            assigned_to_id: this.issue.assigned_to_id,
            priority_id: this.issue.priority_id,
            // fixed_version_id: this.issue.fixed_version_id,
            // author_id: this.issue.tracker_id,
            // lock_version: this.issue.tracker_id,
            // created_on: '',
            // updated_on: '',
            start_date: this.issue.start_date ? moment(this.issue.start_date).format('YYYY-MM-DD') : null,
            done_ratio: this.issue.done_ratio,
            estimated_hours: this.issue.estimated_hours,
            parent_id: this.issue.parent_id,
            // root_id: this.issue.tracker_id,
            is_private: this.issue.is_private,
            // closed_on: null
            project_identifier: this.issue.project.identifier,
            watchers: this.watchers.map((watcher) => watcher.user.id),
        };

        if (!this.isNew) {
            model.notes = this.notes;
            model.private_notes = this.notes_private;
        }

        (this.isNew ? this.issuesService.create(model) : this.issuesService.update(this.issue.id, model))
            .then((response) => {
                const id = response.data.data.id;
                // todo: make link for #id in message or button "open" in toast message
                const message = this.isNew ? 'Issue #' + id + ' created.' : 'Successful update.';

                this.$mdToast.show(
                    this.$mdToast.simple().textContent(message).position('bottom left')
                );

                this.$state.go(
                    createAndContinue ? 'issues-inner.new' : 'issues.info',
                    // todo: get project identifier from response
                    createAndContinue ? {project_id: this.issue.project.identifier} : {id},
                    // {reload: true, inherit: false, notify: true}
                    createAndContinue ? {reload: false, inherit: false, notify: true} : undefined
                );
                // if (createAndContinue) {
                //     // this.$state.go('issues-inner.new', {project_id: response.data.data.project.identifier});
                //     this.$state.go('issues-inner.new', {project_id: this.issue.project.identifier}, {reload: true});
                // } else {
                //     this.$state.go('issues.info', {id});
                // }
            })
            .catch((response) => {
                if (response.status === 422) {
                    this.$mdToast.show(
                        this.$mdToast.simple().textContent(response.data.message).position('bottom left')
                    );
                }

                this.errors = response.data.errors;

                for (const field of Object.keys(response.data.errors)) {
                    if (this.form.hasOwnProperty(field)) {
                        this.form[field].$touched = true;
                        this.form[field].$setValidity('server', false);
                        this.form[field].$error.serverMessage = this.$filter('join')(response.data.errors[field]);
                    }
                }
            });
    }

    change(field) {
        this.form[field].$setValidity('server', true);
        // this.errors[field] = undefined;
        this.form[field].$error.serverMessage = undefined;
    }

    cancel() {
        if (this.$stateParams.id) {
            this.$state.go('issues.info', {id: this.$stateParams.id});
        } else {
            const projectId = this.projectsService.getCurrentId();
            this.$state.go((projectId ? 'issues-inner' : 'issues') + '.list', {project_id: projectId});
        }
    }

}