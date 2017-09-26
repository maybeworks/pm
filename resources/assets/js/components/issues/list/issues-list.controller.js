import ControllerBase from 'base/controller.base';
import angular from 'angular';
import moment from 'moment';
import * as _ from "lodash";

/**
 * @property {$state} $state
 * @property {$showdown} $showdown
 * @property {IssuesService} IssuesService
 * @property {ProjectsService} ProjectsService
 * @property {$stateParams} $stateParams
 * @property {$rootScope} $rootScope
 * @property {TrackersService} TrackersService
 * @property {UsersService} UsersService
 */
export default class IssuesListController extends ControllerBase {

    static get $inject() {
        return ['$state', '$showdown', 'IssuesService', 'ProjectsService', '$stateParams', '$window', '$rootScope', 'TrackersService', 'UsersService'];
    }

    $onInit() {
        let enabledModules = {};
        const currentProjectId = this.currentProjectId();
        this.ProjectsService.one(currentProjectId).then((response) => {
            enabledModules = this.ProjectsService.getModules(_.get(response, 'data.enabled_modules', []));

            if (typeof enabledModules.issue_tracking === 'undefined') {
                window.location.href = '/projects/' + currentProjectId;
            } else {
                this.tags = [];
                this.items = [];
                this.statusesList = [];
                this.prioritiesList = [];
                this.showMore = false;
                this.searchText = null;
                this.selectedIssue = null;
                this.selectAllState = false;
                this.offset = 0;

                this.loadFiltersValues();
                this.load();
                this.$rootScope.$on('updateIssues', () => this.load());
                this.initScrollbar();

                this.UsersService.getList({}).then((response) => {
                    this.users = _.keyBy(_.get(response, 'data', null), 'id');
                });
            }
        });

        this.ProjectsService.getList().then((response) => {
            this.projects = _.keyBy(_.get(response, 'data', null), 'id');
        });
    }

    load() {
        let params = {
            'status_ids': [],
            'tracker_ids': [],
            'priority_ids': [],
            'offset': this.offset
        };

        if (!_.isEmpty(this.tags)) {

            _.forEach(this.tags, (item) => {
                switch (item.type) {
                    case 'tracker':
                        params.tracker_ids.push(item.id);
                        break;
                    case 'status' :
                        params.status_ids.push(item.id);
                        break;

                    case 'priority' :
                        params.priority_ids.push(item.id);
                        break;
                }
            });
        }

        this.selectAllState = false;
        this.IssuesService.getListByProject(this.$stateParams.project_id, params)
            .then((response) => {
                this.list = _.keyBy(response.data, 'id');
                this.count = response.headers('X-Total');
            });
    }

    onChangeFilterValue() {
        this.offset = 0;
        this.load();
    }

    loadFiltersValues() {
        this.IssuesService.getIssuesFilters({enumeration_type: 'IssuePriority'}).then((response) => {
            if (!_.isEmpty(response.data)) {
                this.statuses = _.keyBy(_.get(response, 'data.statuses', null), 'id');
                this.trackers = _.keyBy(_.get(response, 'data.trackers', null), 'id');
                this.priorities = _.keyBy(_.get(response, 'data.priorities', null), 'id');

                if (this.statuses) {
                    _.forEach(this.statuses, (item) => {
                        item.type = 'status';
                        this.statusesList[item.id] = item.name;
                        this.items.push(item);
                    });
                }

                if (this.trackers) {
                    _.forEach(this.trackers, (item) => {
                        item.type = 'tracker';
                        this.items.push(item);
                    });
                }

                if (this.priorities) {
                    _.forEach(this.priorities, (item) => {
                        item.type = 'priority';
                        this.prioritiesList[item.id] = item.name;
                        this.items.push(item);
                    });
                }
            }
        });
    }

    initScrollbar() {
        angular.element(this.$window).bind('resize', () => this.setScrollbarContainerHeight());
        this.setScrollbarContainerHeight();
    }

    selectAll() {
        this.selectAllState = !this.selectAllState;
        this.list.forEach((item) => {
            item.selected = this.selectAllState;
        });
    }

    setScrollbarContainerHeight() {
        let windowHeight = window.innerHeight;

        if (!this.$stateParams.project_id) {
            windowHeight += 50;
        }

        this.scrollBarConfigIssue = {
            setHeight: windowHeight - 340
        };

        this.scrollBarConfigDescription = {
            setHeight: windowHeight - 292
        };
    }

    makeHtml(text) {
        return text ? this.$showdown.stripHtml(this.$showdown.makeHtml(text)) : '';
    }

    querySearch(query) {
        return query ? this.items.filter(this.createFilterFor(query)) : [];
    }

    createFilterFor(query) {
        let lowercaseQuery = angular.lowercase(query);

        return function filterFn(vegetable) {
            return (vegetable.name.indexOf(lowercaseQuery) !== -1) ||
                (vegetable.type.indexOf(lowercaseQuery) !== -1);
        };
    }

    viewIssue(issue) {
        this.IssuesService.getHistory(issue.id).then((response) => {
            this.history = _.keyBy(response.data, 'id')
        });
        this.selectedIssue = issue;
    }

    closeIssueCard() {
        this.selectedIssue = null;
    }

    openIssue(id) {
        this.$state.go('issues.info', {project_id: this.$stateParams.project_id, id: id});
    }

    editIssue(id, edit) {
        this.$state.go('issues.edit', {project_id: this.$stateParams.project_id, id: id});
    }

    copyIssue(id, edit) {
        this.$state.go('issues.copy', {project_id: this.$stateParams.project_id, id: id});
    }

    deleteIssue(id) {
        this.IssuesService.deleteIssue(id).then(() => {
            this.$rootScope.$emit('updateIssues');
        });
    }

    toggleShowMore() {
        this.showMore = !this.showMore;
    }

    next() {
        if (this.offset + 20 < this.count) {
            this.offset += 20;
            this.load();
        }
    }

    previous() {
        if (this.offset > 0) {
            this.offset = this.offset - 20;
            this.load();
        }
    }

    currentProjectId() {
        return _.get(this.$state, 'data.layoutDefault.projectId') || _.get(this.$stateParams, 'project_id');
    }

    showAvatar(hash) {
        return '//www.gravatar.com/avatar/' + hash + '?rating=PG&amp;size=24&amp;default=';
    }

    convertDate(date){
        return moment(date).format('DD/MM/YYYY')
    }
}