import ControllerBase from 'base/controller.base';
import _ from 'lodash';

/**
 * @property {$mdSidenav} $mdSidenav
 * @property {$state} $state
 * @property {ProjectsService} ProjectsService
 * @property {object} MainService
 * @property {UsersService} UsersService
 * @property {$transitions} $transitions
 * @property {$stateParams} $stateParams
 * @property {$rootScope} $rootScope
 */
export default class LayoutDefaultController extends ControllerBase {

    static get $inject() {
        return ['$timeout', '$mdSidenav', '$state', 'projectsService', 'mainService', 'usersService',
            '$transitions', '$stateParams', '$rootScope', '$filter', '$scope'];
    }

    $onInit() {
        // todo: show current user avatar in main menu

        this.items = this.mainService.getAppMenu();
        this.newItems = this.mainService.getNewItemMenu();
        this.projectItems = this.projectsService.getModules();

        // this.setTitle();
        this.menuOpen = false;
        this.loadProjectInfo();
        this.loadMyProjects();

        this.$transitions.onSuccess({}, () => this.loadProjectInfo());
        this.updateProjectInfo = this.$rootScope.$on('updateProjectInfo', () => this.loadProjectInfo());
    }

    $onDestroy() {
        this.updateProjectInfo();
    }

    loadMyProjects() {
        // todo: add is_my param to request
        // todo: load only needed info from projects list
        this.projectsService
            .all()
            .then((response) => {
                this.projects = response.data.data.map((project) => {
                    project.name = this.$filter('words')(project.name, 3);
                    project.avatar = this.$filter('limitTo')(project.name, 1);
                    return project;
                });
            });
    }

    setTitle(title) {
        // todo: get title from config
        this.title = title || 'MaybeWorks PM';
    }

    hlCurrentNavItem() {
        // this is used to display navbar ink bar (underline red bar) on first load
        this.currentNavItem = '';

        this.$timeout(() => {
            this.currentNavItem = _.get(
                this.projectItems.find((item) => {
                    return item.url === this.$state.$current.name || (item.alt && !!item.alt.find((alt) => {
                        return this.$state.$current.name.match(alt);
                    }));
                }), 'url');
        }, 0);
    }

    toggle(menu = 'left') {
        this.$mdSidenav(menu).toggle();
    }

    gotToProject(identifier) {
        this.$state.go('projects.inner.info', {project_id: identifier});
        this.toggle('right');
    }

    myAccount() {
        this.$state.go('my.account');
    }

    logout() {
        this.$state.go('logout');
    }

    menuClick(item) {
        this.$state.go(item.url);
        this.toggle();
    }

    openProjectPage(item) {
        const projectId = this.projectsService.getCurrentId();

        if (projectId) {
            this.$state.go(item.url, {project_id: projectId})
        }
    }

    openNewItemPage(item) {
        const projectId = this.projectsService.getCurrentId();
        const url = projectId || typeof item.single !== 'string' ? item.url : item.single;
        // console.log(projectId);

        this.$state.go(
            url,
            projectId ? {project_id: projectId} : undefined
        );

        // projectId ? this.$state.go(item.url, {project_id: projectId}) : null;
        // _.includes(['projects.new'], item.url) ? this.$state.go(url, {}) : null;
    }

    loadProjectInfo() {
        const projectIdentifier = this.projectsService.getCurrentId();
        this.showProjectMenu = !!projectIdentifier || _.get(this.$state, 'current.data.layout.insideProject');

        if (projectIdentifier) {
            this.projectsService.one(projectIdentifier).then((response) => {
                let modules = _.get(response, 'data.data.modules', []);

                // change visible items in project menu
                this.projectItems.forEach((item) => {
                    if (item.name) {
                        item.enable = modules.some((value) => value.name === item.name);
                    }
                });

                // change visible items in add menu
                this.newItems.forEach((item) => {
                    item.enable = ((!item.module || modules.some((value) => value.name === item.module)) && this.$state.current.name !== item.url);
                });

                // highlight current item in project menu
                this.hlCurrentNavItem();

                this.setTitle(response.data.data.name);
            });
        } else {
            this.newItems.forEach((item) => {
                item.enable = (item.single && (this.$state.current.name !== item.url && this.$state.current.name !== item.single));
            });

            this.setTitle();
        }
    }

}