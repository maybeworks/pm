import ControllerBase from 'base/controller.base';
import _ from 'lodash';

/**
 * @property {NewsService} NewsService
 * @property {$stateParams} $stateParams
 * @property {$state} $state
 */
export default class NewsViewController extends ControllerBase {

    static get $inject() {
        return ['newsService', '$stateParams', '$state'];
    }

    $onInit() {
        this.newsService.one(this.$stateParams.id).then((response) => {
            this.news = response.data;
        });
    }

    sendresponse() {
        this.news.save().then((response) => {
            if (_.get(response, 'status') === 200 && !_.isEmpty(response.data)) {
                this.$state.go('news.list');
            }
        })
    }

}