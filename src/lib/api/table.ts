/* eslint-disable camelcase,@typescript-eslint/camelcase */
import {
    ref,
    onMounted, Ref, watch,
} from '@vue/composition-api';

import {
    QuerySearchTableToolSet,
    SearchTableToolSet,
    ToolboxTableToolSet,
} from '@/components/organisms/tables/toolbox-table/PToolboxTable.toolset';
import {
    DynamicFluentAPIToolSet,
} from '@/lib/api/toolset';
import { forceRefArg } from '@/lib/type';
import {
    ListType, QueryAPI,
} from '@/lib/fluent-api';
import { ACHandlerMeta, defaultACHandler, getQueryItemsToFilterItems } from '@/lib/api/query-search';

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
    getSearchTableDefaultAction: () => action = () => this.getDefaultAction().setKeyword(this.tableTS.searchText.value);

    getAction = () => {
        const action = this.getSearchTableDefaultAction();
        return action;
    };

    resetAll = () => {
        this.defaultReset();
        this.tableTS.searchText.value = '';
    };
}


export class TabSearchTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchTableToolSet<initData, initSyncData> = SearchTableToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends SearchTableFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    constructor(
        action: action,
        protected isShow: forceRefArg<boolean>,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(
            action,
            initData, // sub api can't support only query
            initSyncData,
        );
        onMounted(() => {
            watch(this.isShow, async (show, preShow) => {
                if (show && show !== preShow) {
                    await this.getData();
                }
            }, { immediate: true });
        });
    }
}

export const defaultAdminFields = [
    { name: 'User ID', key: 'user_info.user_id' },
    { name: 'Name', key: 'user_info.name' },
    { name: 'Email', key: 'user_info.email' },
    {
        name: 'Labels', key: 'labels', type: 'list', options: { item: { view_type: 'badge' } },
    },
];

export const defaultAdminOptions = {
    fields: defaultAdminFields,
};

export const defaultAdminLayout = {
    type: 'table',
    options: defaultAdminOptions,
};

export const defaultHistoryFields = [
    { name: 'Key', key: 'key' },
    { name: 'Job ID', key: 'job_id' },
    { name: 'Updated By', key: 'updated_by' },
    {
        name: 'Updated',
        key: 'updated_at',
        type: 'datetime',
        options: {
            source_type: 'timestamp',
            // source_format: 'seconds',
        },
    },

];
export const defaultHistoryOptions = {
    fields: defaultHistoryFields,
    root_path: 'collection_info.change_history',
};

export const defaultHistoryLayout = {
    type: 'table',
    options: defaultHistoryOptions,
};


export class QuerySearchTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchTableToolSet<initData, initSyncData> = QuerySearchTableToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends BaseTableFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    initToolset = (initData, initSyncData, acHandlerMeta: ACHandlerMeta) => {
        this.tableTS = new QuerySearchTableToolSet(acHandlerMeta.keyItems, acHandlerMeta.valueHandlerMap, initData, initSyncData) as T;
        watch(this.tableTS.querySearch.tags, async (tags, preTags) => {
            if (tags !== preTags && this.action) {
                await this.getData(true);
            }
        }, { immediate: false });
    }

    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
        initLazy = false,
    ) {
        super(action);
        if (!initLazy) {
            this.initToolset(initData, initSyncData, acHandlerMeta);
        }
    }

    getAction = () => {
        if (Array.isArray(this.tableTS.querySearch.tags.value)) {
            const items = getQueryItemsToFilterItems(this.tableTS.querySearch.tags.value, this.tableTS.querySearch.state.keyItems);
            return this.getDefaultAction()
                .setFilter(...items.and)
                .setFilterOr(...items.or);
        }
        return this.getDefaultAction();
    }

    resetAll = () => {
        this.defaultReset();
        this.tableTS.querySearch.syncState.value = '';
    };
}
