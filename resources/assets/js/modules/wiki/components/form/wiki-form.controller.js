import ControllerBase from 'base/controller.base';

export default class WikiFormController extends ControllerBase {

    static get $inject() {
        return ['wikisService', 'projectsService', '$stateParams', '$filter', '$state', '$mdToast', '$q'];
    }

    $onInit() {
        this.isNew = !this.$stateParams.name;
        this.title = this.isNew ? 'New wiki page' : this.$stateParams.name;
        this.comments = '';

        this.page = {
            title: this.$stateParams.name,
            content: {
                text: this.$stateParams.name ? '# ' + this.$stateParams.name : '',
            },
            parent_id: null
        };

        this.loadProccess = true;
        this.loadList()
            .then(() => {
                return !this.isNew ? this.load() : true;
            })
            .then(() => {
                this.loadProccess = false;
            });


    }

    load() {
        return this.wikisService
            .one(this.projectsService.getCurrentId(), this.$stateParams.name)
            .then((response) => {
                if (response.status !== 204) {
                    this.page = response.data.data;
                } else {
                    this.isNew = true;
                }
            });
    }

    loadList() {
        return this.wikisService
            .all(this.projectsService.getCurrentId())
            .then((response) => {
                // todo: hide childs of current page and curent page
                this.list = response.data.data;
            });
    }


    submit() {
        const projectId = this.projectsService.getCurrentId();
        let model = {
            text: this.page.content.text,
            parent_id: this.page.parent_id,
            comments: this.comments,
            // todo: need post version?
            // version:
        };

        if (this.isNew) {
            model.title = this.page.title;
        }

        return (this.isNew ? this.wikisService.create(projectId, model) : this.wikisService.update(projectId, this.page.title, model))
            .then((response) => {
                this.$mdToast.show(
                    this.$mdToast.simple().textContent('Success saved!').position('bottom left')
                );

                this.$state.go('wiki.page.view', {name: response.data.data.title});
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

    cancel() {
        if (this.isNew) {
            this.$state.go('wiki.index');
        } else {
            this.$state.go('wiki.page.view', {name: this.page.title});
        }
    }

}