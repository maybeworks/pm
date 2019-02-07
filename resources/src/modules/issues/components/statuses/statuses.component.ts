import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {selectStatuses, selectStatusesRequestId, selectStatusesStatus} from '../../store/selectors/statuses';
import {RequestStatus} from '../../../../app/interfaces/api';
import {StatusesAllRequestAction, StatusesItemRemoveRequestAction} from '../../store/actions/statuses.action';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'app-issues-statuses',
    templateUrl: './statuses.component.html',
    styleUrls: ['./statuses.component.scss'],
})
export class IssuesStatusesComponent implements OnInit, OnDestroy {

    public displayedColumns: Array<string> = ['name', 'closed', 'menu'];
    public dataSource: Array<object>;
    public subscriptions: Array<Subscription> = [];
    public pending = false;
    public removeRequestId = null;
    public status$ = this.store.pipe(select(selectStatusesStatus));
    public items$ = this.store.pipe(select(selectStatuses));
    public requestId$ = this.store.pipe(select(selectStatusesRequestId));
    public removed$ = combineLatest(this.status$, this.requestId$).pipe(
        filter(([status, requestId]) => Boolean(status) && Boolean(requestId)),
        filter(([status, requestId]) => status === RequestStatus.success && requestId === this.removeRequestId),
    );

    public constructor(
        private store: Store<any>,
    ) {
    }

    ngOnInit() {
        this.subscriptions.push(
            this.status$.subscribe((status) => {
                this.pending = status === RequestStatus.pending;
            }),

            this.items$.subscribe((items) => {
                this.dataSource = items;
            }),

            this.removed$.subscribe(() => {
                this.load();
            }),
        );

        this.load();
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    public load(): void {
        this.store.dispatch(new StatusesAllRequestAction());
    }

    public remove(id): void {
        const action = new StatusesItemRemoveRequestAction(id);
        this.removeRequestId = action.requestId;
        this.store.dispatch(action);
    }

}
