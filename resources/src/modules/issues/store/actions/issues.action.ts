import {Action} from '@ngrx/store';
import {ResponseError} from "../../../../app/interfaces/api";

export enum IssuesActionTypes {
    ALL_REQUEST = '[issues] all request',
    ALL_ERROR = '[issues] all error',
    ALL_SUCCESS = '[issues] all success',
    PRELOAD_REQUEST = '[issues] preload',
    ITEM_REQUEST = '[issues] item request',
    ITEM_ERROR = '[issues] item error',
    ITEM_SUCCESS = '[issues] item success',

    // shared
    // AUTH_LOGOUT = '[Auth] Logout',
}

export class IssuesAllRequestAction implements Action {
    readonly type = IssuesActionTypes.ALL_REQUEST;

    constructor(public payload) {
    }
}

export class IssuesAllErrorAction implements Action {
    readonly type = IssuesActionTypes.ALL_ERROR;

    constructor(public payload) {
    }
}

export class IssuesAllSuccessAction implements Action {
    readonly type = IssuesActionTypes.ALL_SUCCESS;

    constructor(public payload) {
    }
}

export class IssuesPreloadRequestAction implements Action {
    readonly type = IssuesActionTypes.PRELOAD_REQUEST;

    constructor() {
    }
}

export class ItemRequestAction implements Action {
    readonly type = IssuesActionTypes.ITEM_REQUEST;

    constructor(public payload: number) {
    }
}

export class ItemErrorAction implements Action {
    readonly type = IssuesActionTypes.ITEM_ERROR;

    constructor(public payload: ResponseError) {
    }
}

export class ItemSuccessAction implements Action {
    readonly type = IssuesActionTypes.ITEM_SUCCESS;

    constructor(public payload: any) {
    }
}


// export class IssuesLogoutSuccessAction implements Action {
//     readonly type = IssuesActionTypes.AUTH_LOGOUT;
//
//     constructor(public payload) {
//     }
// }

export type IssuesActionsUnion =
    | IssuesAllRequestAction
    | IssuesAllErrorAction
    | IssuesPreloadRequestAction
    | IssuesAllSuccessAction
    | ItemErrorAction
    | ItemRequestAction
    | ItemSuccessAction;
// | IssuesLogoutSuccessAction;
