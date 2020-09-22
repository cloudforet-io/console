/* eslint-disable camelcase,@typescript-eslint/camelcase */
import {
    ref,
    onMounted, Ref, watch,
} from '@vue/composition-api';

import {
    SearchTableToolSet,
    ToolboxTableToolSet,
} from '@/components/organisms/tables/toolbox-table/PToolboxTable.toolset';
import {
    DynamicFluentAPIToolSet,
} from '@/lib/api/toolset';
import {
    ListType, QueryAPI,
} from '@/lib/fluent-api';

export abstract class BaseTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends ToolboxTableToolSet<initData, initSyncData> = ToolboxTableToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    tableTS: T;

    totalCount: Ref<number>;

    onChangeSort = async (sortBy: string, sortDesc: boolean) => {
        this.tableTS.onChangeSort(sortBy, sortDesc);
        await this.getData();
    };

    onChangePageSize = async (size: number) => {
        this.tableTS.onChangePageSize(size);
        await this.getData();
    }

    onChangePageNumber = async (number: number) => {
        this.tableTS.onChangePageNumber(number);
        await this.getData();
    }

    onRefresh = async () => {
        await this.getData(true);
    }


    protected constructor(action: action) {
        super(action);
        this.totalCount = ref(0);
        this.tableTS = new ToolboxTableToolSet<initData, initSyncData>() as T;
    }

    protected getDefaultAction(): action {
        return this.action
            .setSortBy(this.tableTS.syncState.sortBy)
            .setSortDesc(this.tableTS.syncState.sortDesc)
            .setThisPage(this.tableTS.syncState.thisPage as number)
            .setPageSize(this.tableTS.syncState.pageSize as number);
    }

    getAction = () => this.getDefaultAction()

    defaultGetData = async (resetThisPage) => {
        if (resetThisPage) {
            this.tableTS.syncState.thisPage = 1;
        }
        this.tableTS.syncState.loading = true;
        this.tableTS.syncState.selectIndex = [];
        try {
            const res = await this.getAction().execute();
            this.tableTS.state.items = res.data.results;
            this.totalCount.value = res.data.total_count;
            this.tableTS.setAllPage(res.data.total_count);
        } catch (e) {
            console.error(e);
            this.tableTS.state.items = [];
            this.tableTS.state.allPage = 1;
            this.totalCount.value = 0;
        } finally {
            this.tableTS.syncState.loading = false;
        }
    };

    getData = async (resetThisPage = false) => {
        await this.defaultGetData(resetThisPage);
    }

    protected defaultReset = () => {
        this.tableTS.state.allPage = 1;
        this.totalCount.value = 0;
        this.tableTS.state.items = [];
        this.tableTS.syncState.thisPage = 1;
        this.tableTS.syncState.selectIndex = [];
        this.tableTS.syncState.sortBy = '';
        this.tableTS.syncState.sortDesc = true;
    };

    resetAll = () => {
        this.defaultReset();
    }
}

export class SearchTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchTableToolSet<initData, initSyncData> = SearchTableToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends BaseTableFluentAPI<parameter, resp, action> {
    tableTS: T;

    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(action);
        this.tableTS = new SearchTableToolSet(initData, initSyncData) as T;
    }

    // @ts-ignore
    getSearchTableDefaultAction: () => action = () => this.getDefaultAction().setKeyword(this.tableTS.searchText?.value);

    getAction = () => {
        const action = this.getSearchTableDefaultAction();
        return action;
    };

    resetAll = () => {
        this.defaultReset();
        this.tableTS.searchText.value = '';
    };
}
