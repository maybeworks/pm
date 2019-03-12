import {
    Component, ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
    FormBuilder, FormControl,
    Validators,
} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {combineLatest, Subscription, Observable} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent, MatSelectChange} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FilterTag, Issue, IssueUpdate} from '../../interfaces/issues';
import {RequestStatus} from '../../../../app/interfaces/api';
import {ItemRequestAction, UpdateRequestAction} from '../../store/actions/issues.action';
import {EnumerationsRequestAction} from '../../store/actions/enumerations.action';

import {selectIssuesActive, selectIssuesStatus, selectMyProjects} from '../../store/selectors/issues';
import {selectStatuses} from '../../store/selectors/statuses';
import {selectPriorities} from '../../store/selectors/priorities';
import {selectTrackers} from '../../store/selectors/trackers';
import {Project} from '../../interfaces/projects';
import * as moment from 'moment';

@Component({
    selector: 'app-issues-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
})
export class IssuesFormComponent implements OnInit, OnDestroy {
    public subscriptions: Subscription[] = [];
    public item: Issue;
    public id: number;
    public identifier: string;
    public statuses$: Observable<any[]>;
    public trackers$: Observable<any[]>;
    public pending$: Observable<boolean> = this.store.pipe(
        select(selectIssuesStatus),
        map((status) => status === RequestStatus.pending),
    );
    public params$: Observable<Params> = this.activatedRoute.params;
    public myProjects$: Observable<Project[]>;
    public priorities$: Observable<any[]>;
    public projects: any[];
    public showDescription: boolean;
    public isNew = false;

    @ViewChild('tagInput')
    public tagInput: ElementRef<HTMLInputElement>;
    public allTags: Array<FilterTag> = [];
    public tags: Array<FilterTag> = [];
    public tagCtrl = new FormControl();
    public separatorKeysCodes: Array<number> = [ENTER, COMMA];
    public filteredTags: Observable<Array<FilterTag>>;

    public form = this.fb.group({
        'subject': ['', Validators.required],
        'is_private': [''],
        'private_notes': [''],
        'description': [''],
        'notes': [''],
        'project': ['', Validators.required],
        'tracker': ['', Validators.required],
        'status': ['', Validators.required],
        'priority': ['', Validators.required],
        'assigned': [''],
        'start_date': [''],
        'due_date': [''],
        'parent_id': [''],
        'estimated_hours': [''],
        'done_ratio': [''],
        'watchers': [''],
    });

    public constructor(
        private store: Store<any>,
        private activatedRoute: ActivatedRoute,
        public router: Router,
        private fb: FormBuilder,
    ) {
    }

    public ngOnInit(): void {
        this.showDescription = this.isNew;
        this.myProjects$ = this.store.pipe(select(selectMyProjects));
        this.trackers$ = this.store.pipe(select(selectTrackers));
        this.statuses$ = this.store.pipe(select(selectStatuses));
        this.priorities$ = this.store.pipe(select(selectPriorities));

        this.filteredTags = this.tagCtrl.valueChanges.pipe(
            startWith(null),
            map((label: string) => this.filter(label)),
        );

        this.subscriptions.push(
            this.myProjects$.subscribe((projects) => {
                if (projects) {
                    this.projects = projects;
                }
            }),

            this.params$.subscribe((params) => {
                if (params.id) {
                    this.load(Number(params.id));
                    this.id = Number(params.id);
                }
                if (params.identifier) {
                    this.identifier = params.identifier;
                }
            }),

            combineLatest(this.store.pipe(select(selectIssuesActive)), this.params$)
                .pipe(
                    filter(([issue, params]) => issue && issue.id === Number(params.id)),
                    map((([issue]) => issue)),
                ).subscribe((data) => {
                if (data && data.project && data.project.members && data.watchers) {
                    this.tags = [];
                    this.allTags = data.project.members.map((member) => {
                        const tag = {name: member.user.full_name, id: member.user.id};
                        if (data.watchers.some((watcher) => watcher.id === tag.id)) {
                            this.tags.push(tag);
                        }
                        return tag;
                    });
                }

                this.item = data;
                const {
                    subject = '',
                    description = '',
                    is_private,
                    notes = '',
                    project = '',
                    tracker = '',
                    status = '',
                    priority = '',
                    assigned = '',
                    start_date = '',
                    due_date = '',
                    parent_id = '',
                    estimated_hours = '',
                    done_ratio = '',
                    watchers = '',
                } = this.item;

                this.form.setValue({
                    subject,
                    description,
                    is_private,
                    private_notes: false,
                    notes,
                    project: project.identifier ? project.identifier : '',
                    tracker: tracker.id,
                    status: status.id ? status.id : '',
                    priority: priority.id,
                    assigned: assigned && assigned.id ? assigned.id : '',
                    start_date,
                    due_date,
                    parent_id,
                    estimated_hours,
                    done_ratio,
                    watchers,
                });

                this.tagInput.nativeElement.value = '';
                this.tagCtrl.setValue(null);
            }),
        );

        this.store.dispatch(new EnumerationsRequestAction());
    }

    public load(id): void {
        this.store.dispatch(new ItemRequestAction(id));
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    public selected(event: MatAutocompleteSelectedEvent): void {
        const tag = this.allTags.find((tagItem) => this.getTagLabel(tagItem) === event.option.viewValue);
        if (tag && this.tags.indexOf(tag) === -1) {
            this.tags.push(tag);
            this.tagInput.nativeElement.value = '';
            this.tagCtrl.setValue(null);
        }
    }

    public getTagLabel(tag: FilterTag): string {
        return tag.name.trim();
    }

    public removeTag(tag: FilterTag): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
            this.tagCtrl.setValue(null);
            this.tagInput.nativeElement.focus();
        }
    }

    private filter(label: string): Array<FilterTag> {
        const ids = this.tags.map((tag) => tag.id);
        const restTags = this.allTags.filter((tag) => ids.indexOf(tag.id) === -1);
        if (!label) {
            return restTags;
        }

        const filterLabel = label.toLowerCase();
        return restTags.filter((tag) =>
            this.getTagLabel(tag).toLowerCase().indexOf(filterLabel) !== -1,
        );
    }

    public onSelection($event: MatSelectChange) {
        this.myProjects$.subscribe(projects => {
            const [project] = projects.filter(project => project.identifier === $event.value);
            if (project) {
                if (project && project.members) {
                    this.tags = [];
                    this.allTags = project.members.map((member) => {
                        return {name: member.user.full_name, id: member.user.id};
                    });
                    this.tagInput.nativeElement.value = '';
                    this.tagCtrl.setValue(null);
                }
            }
        });
    }

    public onSubmit(): void {
        const controls = this.form.controls;
        if (this.form.invalid) {
            Object.keys(controls).forEach((name) => controls[name].markAsTouched());
            return;
        }
        const watchers = this.tags.map(tag => tag.id);
        const {
            assigned,
            description,
            done_ratio,
            estimated_hours,
            is_private,
            private_notes,
            notes,
            parent_id,
            priority,
            project,
            status,
            subject,
            tracker
        } = this.form.value;

        const start_date = this.form.value.start_date ? moment(this.form.value.start_date).format('YYYY-MM-DD') : '';
        const due_date = this.form.value.due_date ? moment(this.form.value.due_date).format('YYYY-MM-DD') : '';

        const body: IssueUpdate = {
            assigned_to_id: assigned,
            description,
            done_ratio,
            due_date,
            estimated_hours,
            is_private,
            notes,
            parent_id,
            priority_id: priority,
            private_notes,
            project_identifier: project,
            start_date,
            status_id: status,
            subject,
            tracker_id: tracker,
            watchers
        };
        this.store.dispatch(new UpdateRequestAction({id: this.id, body}));
    }

    cancel() {
        if (this.id) {
            this.router.navigateByUrl(`issues/${this.id}`);
        } else if (this.identifier && this.isNew) {
            this.router.navigateByUrl(`projects/${this.identifier}/issues`);
        } else {
            this.router.navigateByUrl(`issues`);
        }
    }

    preview() {

    }
}
