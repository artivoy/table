import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable, Subscription, firstValueFrom, lastValueFrom, of } from 'rxjs';
import { catchError, debounceTime, map, skip } from 'rxjs/operators';
import { AnilistService } from 'src/app/services/anilist.service';
import { EpisodesQuery, EpisodesQueryVariables, InputMaybe, Media, MediaSort } from 'src/graphql/generated';
import { ApolloQueryResult } from '@apollo/client/core';
import { TableTemplate } from 'src/app/model/table/table.model';
import { NgFor, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
    selector: 'app-table-wrapper',
    templateUrl: './table-wrapper.component.html',
    styleUrls: ['./table-wrapper.component.scss'],
    standalone: true,
    imports: [
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSortModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        FormsModule,
        NgFor,
        NgIf,
    ],
})
export class TableWrapperComponent implements AfterViewInit, OnInit, OnDestroy {

    private feedQuery: Observable<ApolloQueryResult<EpisodesQuery>> | undefined;
    private feed: Media[] | undefined = undefined;
    private itemsPerPage: number = 10;
    private itemsSort: InputMaybe<InputMaybe<MediaSort> | InputMaybe<MediaSort>[]> | undefined;
    private subscription = new Subscription();

    public resultsLength = 0;
    public isLoadingResults = true;

    public filter = new FormControl(null);
    public page: number = 1;
    public columns = TableTemplate;
    public displayedColumns: string[] = this.manageColumns();
    public dataSource = new MatTableDataSource<Media>(this.feed);

    hideColumns = this._formBuilder.group({
        english: false,
        status: false,
        type: false,
        popularity: false,
        averageScore: false
      });



    constructor(private gqlData: AnilistService, private _formBuilder: FormBuilder) { }

    async ngOnInit(): Promise<void> {
        await this.getData();
        this.subscription.add(
            this.filter.valueChanges
                .pipe(
                    // because the filter is a BehaviorSubject we will skip the first value, so as not to trigger the valueChanges with the initial value
                    skip(1),
                    debounceTime(900)
                )
                .subscribe((_) => {
                    if (this.filter.value === '') this.filter.patchValue(null);
                    this.page = 1;
                    this.getData();
                })
        );

    }

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngAfterViewInit() {
        this.subscription.add(
            this.sort.sortChange.subscribe((event) => this.sortData(event))
        )

        this.subscription.add(
            this.paginator.page.subscribe((page) => this.paginatorHandle(page))
        )

        this.subscription.add(
            this.hideColumns.valueChanges.subscribe((formObject)=> {
                let fieldsToShow = Object.entries(formObject)
                .filter(filteredArray => filteredArray[1] === false)
                .map(listOfFields => listOfFields[0]);

                this.displayedColumns = fieldsToShow
            })
        )
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private async getData() {
        this.isLoadingResults = true;
        this.feedQuery = this.loadEpisodes();
        this.feed = await firstValueFrom(this.feedQuery.pipe(
            catchError(() => of(null)),
            map(res => {
                this.isLoadingResults = false;
                if(res === null) {
                    return [];
                }
                this.resultsLength = res.data.Page?.pageInfo?.total ?? 0;

                return res?.data?.Page?.media as Media[] ?? [];
            })
        ));
        this.dataSource.data = this.feed
    }

    private loadEpisodes() {
        const criteria: EpisodesQueryVariables = {
            page: this.page,
            perPage: this.itemsPerPage,
            sort: this.itemsSort,
            search: this.filter?.value
        };

        return this.gqlData.getEpisodes(criteria);
    }

    private paginatorHandle(page: PageEvent) {
        this.page = page.pageIndex + 1;
        this.itemsPerPage = page.pageSize;
        this.getData();
    }

    private sortData(event: Sort) {
        //sorting by English name isnt working from API
        let sortedColumn = this.columns.find(column => column.column === event.active);
        if (sortedColumn) {
            this.itemsSort = sortedColumn.sort[event.direction as 'asc' | 'desc'];
            this.page = 1;
            this.getData();
        }
    }
    private manageColumns() {
        return this.columns.filter(visible => !visible.hide).map(column => column.column);
    }
}
