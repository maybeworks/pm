import ControllerBase from 'base/controller.base';

/**
 * @property {Object} $state
 */
export default class RolesIndexController extends ControllerBase {

    static get $inject() {
        return ['$state','rolesService'];
    }

    $onInit() {
        // return  this.rolesService.all()
        //     .getList()
        //     .then((response) => {
        //         this.roles = response.data;
        //     });
    }

    // editRole(id){}
    // copyRole(id){}
    // deleteRole(id){}
    //
    // beenAdded(id) {
    //     return (id == 1 || id == 2) ? 0 : 1;
    // }

}