import ControllerBase from 'base/controller.base';

export default class NewsMyLatestController extends ControllerBase {

    static get $inject() {
        return [];
    }

    $onInit() {
        this.issues = [];
    }

}