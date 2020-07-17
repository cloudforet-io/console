/* eslint-disable camelcase,@typescript-eslint/camelcase */
import Vue from 'vue';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    ref,
    computed, getCurrentInstance, isRef, onMounted, reactive, Ref, watch,
} from '@vue/composition-api';

import {
    QuerySearchTableToolSet,
    SearchTableToolSet,
    ToolboxTableToolSet,
} from '@/components/organisms/tables/toolbox-table/toolset';
import {
    BaseApiState, transformHandlerType, getDataAPI, DynamicFluentAPIToolSet,
} from '@/lib/api/toolset';
import { forceRefArg, readonlyRefArg } from '@/lib/type';
import { ApiQuery, defaultQuery } from '@/lib/api/query';
import {
    GetDataAction, ListType, MemberListAction, QueryAPI,
} from '@/lib/fluent-api';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/type';
import { ACHandlerMeta, defaultACHandler, getQueryItemsToFilterItems } from '@/lib/api/query-search';
import { ComponentInstance } from '@vue/composition-api/dist/component';

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
        this.tableTS.state.items = [];
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

export class SubDataFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchTableToolSet<initData, initSyncData> = SearchTableToolSet<initData, initSyncData>,
    action extends GetDataAction<any, any> = GetDataAction<parameter, resp>,
    > extends SearchTableFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    getAction = () => this.getSearchTableDefaultAction()
        .setKeyPath(this.keyPath.value)
        .setId(this.resourceId.value);

    constructor(
        action: action,
        protected keyPath: forceRefArg<string>,
        protected resourceId: forceRefArg<string>,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(
            action,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
                selectable: false,
                excelVisible: true,
                ...initData,
            }, // sub api can't support only query
            initSyncData,
        );
        onMounted(() => {
            watch([this.resourceId, this.keyPath], async (origin, before) => {
                let id;
                let path;
                let preId;
                let prePath;
                if (origin) {
                    id = origin[0];
                    path = origin[1];
                }
                if (before) {
                    preId = before[0];
                    prePath = before[1];
                }

                if (id && path && (id !== preId || path !== prePath)) {
                    await this.getData();
                }
            });
        });
    }
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
            });
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
        this.tableTS = new QuerySearchTableToolSet(acHandlerMeta.keyHandler, acHandlerMeta.valueHandlerMap, acHandlerMeta.suggestKeys, initData, initSyncData) as T;
        watch(this.tableTS.querySearch.tags, async (tags, preTags) => {
            if (tags !== preTags && this.action) {
                await this.getData(true);
            }
        }, { lazy: true });
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
            const items = getQueryItemsToFilterItems(this.tableTS.querySearch.tags.value, this.tableTS.querySearch.suggestKeys);
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


export abstract class BaseTableAPI<
        initData = any,
        initSyncData = any,
        T extends ToolboxTableToolSet<initData, initSyncData> = ToolboxTableToolSet<initData, initSyncData>
    > extends getDataAPI {
    tableTS: T;

    vm: Vue;

    apiState: UnwrapRef<BaseApiState>


    protected constructor(
        url: readonlyRefArg<string>,
        only: readonlyRefArg<string[]> = [],
        extraParams: readonlyRefArg<any> = {},
        fixSearchQuery: SearchQueryType[] = [],
        transformHandler: transformHandlerType|null = null,
    ) {
        super();
        // @ts-ignore
        this.vm = getCurrentInstance();
        this.apiState = reactive({
            url,
            only,
            fixSearchQuery, // default fix query
            extraParams, // for api extra parameters
            transformHandler,
        });
        this.tableTS = new ToolboxTableToolSet<initData, initSyncData>() as T;
    }

    protected abstract paramQuery: Ref<ApiQuery>;

    // @ts-ignore
    protected requestData = async () => {
        const params = {
            query: this.paramQuery.value,
            ...this.apiState.extraParams,
        };
        const resp = await this.$http.post(this.apiState.url, params).then((response) => {
            let result = response;
            if (this.apiState.transformHandler) {
                try {
                    result = this.apiState.transformHandler(response);
                } catch (e) {
                    console.error(e);
                }
            }
            return result;
        });
        return resp;
    };


    getData = async (resetThisPage = false) => {
        if (resetThisPage) {
            this.tableTS.syncState.thisPage = 1;
        }
        this.tableTS.syncState.loading = true;
        this.tableTS.state.items = [];
        this.tableTS.syncState.selectIndex = [];
        try {
            const res = await this.requestData();
            this.tableTS.state.items = res.data.results;
            this.tableTS.setAllPage(res.data.total_count);
        } catch (e) {
            this.tableTS.state.items = [];
            this.tableTS.state.allPage = 1;
        }
        this.tableTS.syncState.loading = false;
    };

    protected defaultReset = () => {
        this.tableTS.state.allPage = 1;
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

export class SearchTableAPI<initData = any, initSyncData = any,
    T extends SearchTableToolSet<initData, initSyncData> = SearchTableToolSet<initData, initSyncData>> extends BaseTableAPI<initData, initSyncData, T> {
    constructor(
        url: readonlyRefArg<string>,
        only: readonlyRefArg<string[]> = [],
        extraParams: readonlyRefArg<any> = {},
        fixSearchQuery: SearchQueryType[] = [],
        initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(url, only, extraParams, fixSearchQuery);
        this.tableTS = new SearchTableToolSet(initData, initSyncData) as T;
    }

    protected paramQuery = computed(() => defaultQuery(
        (this.tableTS.syncState.thisPage as number), (this.tableTS.syncState.pageSize as number),
        this.tableTS.syncState.sortBy, this.tableTS.syncState.sortDesc, this.tableTS.searchText.value,
        // @ts-ignore
        this.apiState.fixSearchQuery, undefined, this.apiState.only,
    ));

    resetAll = () => {
        this.defaultReset();
        this.tableTS.searchText.value = '';
    }
}

interface DataSource {
    name: string;
    key: string;
    view_type?: string;
    view_option?: any;

}


export class SubDataAPI<initData = any, initSyncData = any> extends SearchTableAPI<initData, initSyncData> {
    // @ts-ignore
    constructor(
        url: readonlyRefArg<string>,
        idKey: string,
        // eslint-disable-next-line @typescript-eslint/no-parameter-properties
        private keyPath: readonlyRefArg<string>,
        // eslint-disable-next-line @typescript-eslint/no-parameter-properties
        private id: readonlyRefArg<string>,
        initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(url, undefined, undefined, undefined, initData, initSyncData);
        this.apiState.extraParams = computed(() => ({
            key_path: isRef(this.keyPath) ? this.keyPath.value : this.keyPath,
            [idKey]: isRef(this.id) ? this.id.value : this.id,
        }));
    }
}
