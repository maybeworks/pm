import {combineReducers} from '@ngrx/store';
import {Entities, Project} from '../../interfaces/projects';
import * as ProjectsActions from '../actions/projects.actions';
import {updateStateEntities} from '../../../../app/store/utils';

export const entities = (state: Entities<Project> = {}, action: ProjectsActions.ActionsUnion) => {
    switch (action.type) {
        case ProjectsActions.ActionTypes.ONE_SUCCESS: {
            return updateStateEntities(state, action.payload.entities.roles);
        }

        default: {
            return state;
        }
    }
};

export interface State {
    entities: Entities<any>;
}

export const reducer = combineReducers({
    entities,
});
