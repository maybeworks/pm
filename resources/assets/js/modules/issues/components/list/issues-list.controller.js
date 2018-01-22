import ControllerBase from 'base/controller.base';
import issuesViewModalTemplate from '../view-modal/issues-view-modal.html';
import issuesViewModalController from '../view-modal/issues-view-modal.controller';

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
        return ['$mdToast', '$state', '$showdown', 'IssuesService', 'ProjectsService', '$stateParams', '$window', '$rootScope', 'TrackersService', 'UsersService', '$mdDialog'];
    }

    $onInit() {
        // selected tags for filter
        this.tags = [];

        // available parameters for the filter
        this.items = [];

        // text in filter input
        this.searchText = '';

        // available parameters for the sorting
        this.sortList = [
            {param: 'id:asc', name: 'ID - Ascending'},
            {param: 'id:decs', name: 'ID - Descending'},
            {param: 'updated_on:asc', name: 'Updated - Oldest first'},
            {param: 'updated_on:decs', name: 'Updated - Newst first'},
        ];
        this.sort = this.sortList[3];

        // group by list
        this.groupByList = [
            {param: '', name: 'No group'},
            {param: 'project', name: 'Project'},
            {param: 'tracker', name: 'Tracker'},
            {param: 'status', name: 'Status'},
            {param: 'priority', name: 'Priority'},
            {param: 'author', name: 'Author'},
            {param: 'assigned', name: 'Assignee'},
            {param: 'category', name: 'Category'},
            {param: 'version', name: 'Target version'},
            {param: 'done_ratio', name: '% Done'},
        ];
        this.groupBy = this.groupByList[0];
        this.groupsInfo = [];

        // item selection
        this.selectedGroup = [];
        this.selectAllState = false;

        // pagination
        this.perPageList = [20, 50, 100];
        this.count = 0;
        this.offset = 0;
        this.limitPerPage = this.perPageList[0];
        this.pager = '';

        // issues list
        this.list = [];
        if (this.$stateParams.hasOwnProperty('assigned_to_ids') && this.$stateParams.assigned_to_ids != null) {
            // temp added to items list
            this.items.push({
                id: this.$stateParams.assigned_to_ids.id,
                type: 'assigned',
                name: this.$stateParams.assigned_to_ids.firstname + ' ' + this.$stateParams.assigned_to_ids.lastname
            });
            this.tags.push({
                id: this.$stateParams.assigned_to_ids.id,
                type: 'assigned',
                name: this.$stateParams.assigned_to_ids.firstname + ' ' + this.$stateParams.assigned_to_ids.lastname
            });
        }
        if (this.$stateParams.hasOwnProperty('author_ids') && this.$stateParams.author_ids != null) {
            // temp added to items list
            this.items.push({
                id: this.$stateParams.author_ids.id,
                type: 'created',
                name: this.$stateParams.author_ids.firstname + ' ' + this.$stateParams.author_ids.lastname
            });
            this.tags.push({
                id: this.$stateParams.author_ids.id,
                type: 'created',
                name: this.$stateParams.author_ids.firstname + ' ' + this.$stateParams.author_ids.lastname
            });
        }
        this.loadProccess = false;

        // available params for all issue
        this.statusList = [];
        this.priorityList = [];

        this.loadFiltersValues().then(() => this.load());
        this.$rootScope.$on('updateIssues', () => this.load());
    }

    load() {
        this.selectAllState = false;
        this.selectedGroup = [];
        this.loadProccess = true;

        return this.IssuesService.all()
            .getList({
                project_identifier: this.currentProjectId(),
                limit: this.limitPerPage,
                offset: this.offset,
                order: this.sort.param,
                group: this.groupBy.param,
                'status_ids[]': this.tags.filter((e) => e.type === 'status').map((e) => e.id),
                'tracker_ids[]': this.tags.filter((e) => e.type === 'tracker').map((e) => e.id),
                'priority_ids[]': this.tags.filter((e) => e.type === 'priority').map((e) => e.id),
                'assigned_to_ids[]': this.tags.filter((e) => e.type === 'assigned').map((e) => e.id),
                'author_ids[]': this.tags.filter((e) => e.type === 'created').map((e) => e.id)
            })
            .then((response) => {
                this.list = response.data;
                this.offset = parseInt(response.headers('X-Offset')) || 0;
                this.limitPerPage = parseInt(response.headers('X-Limit')) || 0;
                this.count = parseInt(response.headers('X-Total')) || 0;
                this.groupsInfo = response.groups;
                this.pager = this.getPager();
                this.loadProccess = false;
            });
    }

    currentProjectId() {
        return this.$stateParams.hasOwnProperty('project_id') ? this.$stateParams.project_id : null;
    }

    onChangeFilterValue() {
        this.offset = 0;
        this.load();
    }

    loadFiltersValues() {
        return this.IssuesService.filters()
            .get({
                project_identifier: this.currentProjectId()
            })
            .then((response) => {
                this.statusList = response.data.statuses.map((e) => {
                    e.type = 'status';

                    // default filter value
                    if (!e.is_closed) {
                        this.tags.push(e);
                    }

                    return e;
                });

                this.priorityList = response.data.priorities.map((e) => {
                    e.type = 'priority';
                    return e;
                });

                // filter available parameters
                this.items.push(
                    ...this.statusList,
                    ...this.priorityList,
                    ...response.data.trackers.map((e) => {
                        e.type = 'tracker';
                        return e;
                    })
                );
            });
    }

    selectAll() {
        this.selectAllState = !this.selectAllState;
        this.selectedGroup = [];

        this.list.forEach((item) => {
            item.selected = this.selectAllState;

            if (this.selectAllState) {
                this.addToSelectedGroup(item);
            }
        });
    }

    onSelectIssue(issue) {
        issue.selected ? this.addToSelectedGroup(issue) : this.removeFromSelectedGroup(issue.id);
    }

    addToSelectedGroup(issue) {
        this.selectedGroup.push(issue);
    }

    removeFromSelectedGroup(id) {
        const index = this.selectedGroup.findIndex((item) => {
            return item.id === id;
        });

        this.selectedGroup.splice(index, 1);
    }

    querySearch() {
        let items = this.items.filter((e) => {
                return !this.tags.some((tag) => tag.type === e.type && tag.id === e.id);
            }),
            query = this.searchText.toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((e) => {
            return (e.name.toLowerCase().indexOf(query) !== -1) ||
                (e.type.toLowerCase().indexOf(query) !== -1);
        });
    }

    viewIssue($event, issue) {
        this.$mdDialog.show(
            this.constructor.setMdDialogConfig($event.target, {
                selectedIssue: issue
            })
        );
    }

    deleteGroup() {
        let title_issue = this.selectedGroup.length > 1 ? 'issues' : 'issue';
        let confirm = this.$mdDialog.confirm()
            .title(`Would you like to delete this ${title_issue}?`)
            .ok('Delete!')
            .cancel('Cancel');

        this.$mdDialog.show(confirm).then(() => {
            this.selectedGroup.forEach((issue) => {
                this.deleteConfirmedIssue(issue.id);
            });
            this.selectedGroup = [];
        });
    }

    deleteConfirmedIssue(id) {
        this.IssuesService.deleteIssue(id).then(() => {
            this.$rootScope.$emit('updateIssues');
        });

        this.selectedGroup = [];
    }

    setSort(item) {
        this.sort = item;
        this.offset = 0;
        this.load();
    }

    setGroupBy(item) {
        this.groupBy = item;
        this.offset = 0;
        this.load();
    }

    setLimitPerPage(count) {
        this.limitPerPage = count;
        this.offset = 0;
        this.load();
    }

    next() {
        if (this.offset + this.limitPerPage < this.count) {
            this.offset += this.limitPerPage;
            this.load();
        }
    }

    previous() {
        if (this.offset > 0) {
            this.offset = this.offset - this.limitPerPage;
            this.load();
        }
    }

    getPager() {
        const currentPage = (this.offset === 0 ? this.offset + 1 : this.offset);
        const fromPage = (this.count < this.limitPerPage || this.count < this.offset + this.limitPerPage) ?
            this.count : this.limitPerPage + this.offset;
        const all = (this.count > this.limitPerPage ? ' /' + this.count : '');

        return currentPage + '-' + fromPage + all;
    }

    static setMdDialogConfig(target, data = {}) {
        return {
            controller: issuesViewModalController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: data,
            template: issuesViewModalTemplate,
            clickOutsideToClose: true,
            openFrom: target,
            closeTo: target,
        };
    }

    openIssue(id) {
        this.$state.go('issues.info', {id: id});
    }

    editIssue(id) {
        this.$state.go('issues.edit', {id: id});
    }

    copyIssue(id) {
        this.$state.go('issues.copy', {id: id});
    }

    deleteIssue(item) {
        let confirm = this.$mdDialog.confirm()
            .title('Would you like to delete this issue?')
            .ok('Delete!')
            .cancel('Cancel');

        return this.$mdDialog.show(confirm)
            .then(() => item.remove())
            .then(() => this.load());
    }
}