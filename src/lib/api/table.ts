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
import {
    BaseAutocompleteHandler, SEARCH_PREFIX, setFilterOrWithSuggestKeys,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { ApiQuery, defaultQuery } from '@/lib/api/query';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import {
    FilterItem,
    GetDataAction, ListType, MemberListAction, QueryAPI,
} from '@/lib/fluent-api';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import _ from 'lodash';
import {
    getArrayQueryString, pushRouterQuery, RouterAPIToolsetInterface,
} from '@/lib/router-query-string';
import { isNotEmpty } from '@/lib/util';
import { makeSearchQuery, makeSearchText } from '@/components/organisms/search/query-search-bar/toolset';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/type';
import NumberBadge from '@/components/molecules/badges/number-badge/NumberBadge.vue';

interface DynamicTableOptions{
    options: any;
}

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
    { name: 'Job ID', key: 'job_id'},
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


export interface ACHandlerMeta {
    handlerClass: typeof BaseAutocompleteHandler;
    args: any;
}

export const defaultACHandler: ACHandlerMeta = {
    handlerClass: QuerySearchTableACHandler,
    args: {
        keys: [],
        suggestKeys: [],
    },
};


export class QuerySearchTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchTableToolSet<initData, initSyncData> = QuerySearchTableToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends BaseTableFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    initToolset = (initData, initSyncData, acHandlerMeta) => {
        this.tableTS = new QuerySearchTableToolSet(acHandlerMeta.handlerClass, acHandlerMeta.args, initData, initSyncData) as T;
        watch(this.tableTS.querySearch.tags, async (tags, preTags) => {
            if (tags !== preTags && this.action) {
                await this.getData(true);
            }
        });
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
            const and: FilterItem[] = [];
            const or: FilterItem[] = [];
            this.tableTS.querySearch.tags.value.forEach((q) => {
                if (q.key !== SEARCH_PREFIX) and.push(q);
                else if (this.tableTS.querySearch.acHandlerArgs.suggestKeys) {
                    setFilterOrWithSuggestKeys(q, this.tableTS.querySearch.acHandlerArgs.suggestKeys, or);
                }
            });
            return this.getDefaultAction()
                .setFilter(...and)
                .setFilterOr(...or);
        }
        return this.getDefaultAction();
    }

    resetAll = () => {
        this.defaultReset();
        this.tableTS.querySearch.state.searchText = '';
    };
}
interface QuerySearchQSNameType{
    selectItems: string;
    filters: string;
    sortBy: string;
    sortDesc: string;
    thisPage: string;
    pageSize: string;
    search: string;
}

export enum DefaultQSTableQSPropsName {
    selectItems= 'sl',
    filters= 'f',
    sortBy='sb',
    sortDesc= 'sd',
    thisPage= 'p',
    pageSize= 'ps',
    search= 't_se',
}
export const makeQSTableQSProps = (names: QuerySearchQSNameType) => ({
    [names.selectItems]: {
        type: [Array, String, Number],
        default: null,
    },
    [names.filters]: {
        type: [Array, String],
        default: null,
    },
    [names.sortBy]: {
        type: String,
        default: null,
    },
    [names.sortDesc]: {
        type: String,
        default: null,
    },
    [names.thisPage]: {
        type: [String, Number],
        default: null,
    },
    [names.pageSize]: {
        type: [String, Number],
        default: null,
    },
    [names.search]: {
        type: [String, Number],
        default: null,
    },
});

export class RouteSearchTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchTableToolSet<initData, initSyncData> = SearchTableToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends SearchTableFluentAPI<parameter, resp, initData, initSyncData, T, action> implements RouterAPIToolsetInterface {
    constructor(
        action: action,
        initData: initData = undefined as unknown as initData,
        initSyncData: initSyncData = undefined as unknown as initSyncData,
        public vm: Vue|ComponentInstance,
        public qsName: QuerySearchQSNameType = DefaultQSTableQSPropsName,
        public isReady = false,
        initLazy = false,
    ) {
        super(action, initData, initSyncData);

        watch(() => this.tableTS.syncState.selectIndex, async (aft, bef) => {
            if (!_.isEqual(aft, bef)) {
                await this.routerPush();
            }
        });
    }

    applyAPIRouter = (props: any) => {
        if (isNotEmpty(props[this.qsName.pageSize])) {
            this.tableTS.syncState.pageSize = Number(props[this.qsName.pageSize]);
        }
        if (isNotEmpty(props[this.qsName.thisPage])) {
            this.tableTS.syncState.thisPage = Number(props[this.qsName.thisPage]);
        }
        if (isNotEmpty(props[this.qsName.sortBy])) {
            this.tableTS.syncState.sortBy = props[this.qsName.sortBy];
            this.tableTS.syncState.sortDesc = Boolean(props[this.qsName.sortDesc]);
        }
        const search = props[this.qsName.search];
        if (isNotEmpty(search)) {
            this.tableTS.searchText.value = search;
        }

        this.isReady = true;
    };

    applyDisplayRouter =(props: any) => {
        const selectItems = props[this.qsName.selectItems];
        if (isNotEmpty(selectItems)) {
            this.tableTS.syncState.selectIndex = getArrayQueryString(selectItems, Number);
        }
    }

    routerPush = async () => {
        const query = {
            ...this.vm.$route.query,
            [this.qsName.sortBy]: this.tableTS.syncState.sortBy,
            [this.qsName.sortDesc]: String(this.tableTS.syncState.sortDesc),
            [this.qsName.thisPage]: this.tableTS.syncState.thisPage,
            [this.qsName.pageSize]: this.tableTS.syncState.pageSize,
            [this.qsName.selectItems]: this.tableTS.syncState.selectIndex,
            [this.qsName.search]: this.tableTS.searchText.value,
        };
        if (!query[this.qsName.sortBy]) {
            delete query[this.qsName.sortDesc];
        }
        await pushRouterQuery(this.vm, query);
    }

    getData = async (resetThisPage = false) => {
        if (this.isReady) {
            await this.defaultGetData(resetThisPage);
            await this.routerPush();
        }
    };
}


export const DefaultQSTableQSProps = makeQSTableQSProps(DefaultQSTableQSPropsName);
export class RouteQuerySearchTableFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchTableToolSet<initData, initSyncData> = QuerySearchTableToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends QuerySearchTableFluentAPI<parameter, resp, initData, initSyncData, T, action> implements RouterAPIToolsetInterface {
    constructor(
        action: action,
        initData: initData = undefined as unknown as initData,
        initSyncData: initSyncData = undefined as unknown as initSyncData,
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
        public vm: Vue|ComponentInstance,
        public qsName: QuerySearchQSNameType = DefaultQSTableQSPropsName,
        public isReady = false,
        initLazy = false,
    ) {
        super(action, initData, initSyncData, acHandlerMeta, true);
        if (!initLazy) {
            this.initToolset(initData, initSyncData, acHandlerMeta);
        }
        watch(() => this.tableTS.syncState.selectIndex, async (aft, bef) => {
            if (!_.isEqual(aft, bef)) {
                await this.routerPush();
            }
        });
    }

    applyAPIRouter = (props: any) => {
        if (isNotEmpty(props[this.qsName.pageSize])) {
            this.tableTS.syncState.pageSize = Number(props[this.qsName.pageSize]);
        }
        if (isNotEmpty(props[this.qsName.thisPage])) {
            this.tableTS.syncState.thisPage = Number(props[this.qsName.thisPage]);
        }
        const filters = props[this.qsName.filters];
        if (isNotEmpty(filters)) {
            this.tableTS.querySearch.tags.value = getArrayQueryString(filters, makeSearchQuery);
            // console.debug(this.tableTS.querySearch.tags.value);
        }
        if (isNotEmpty(props[this.qsName.sortBy])) {
            this.tableTS.syncState.sortBy = props[this.qsName.sortBy];
            this.tableTS.syncState.sortDesc = Boolean(props[this.qsName.sortDesc]);
        }
        if (isNotEmpty(props[this.qsName.sortBy])) {
            this.tableTS.syncState.sortBy = props[this.qsName.sortBy];
            this.tableTS.syncState.sortDesc = Boolean(props[this.qsName.sortDesc]);
        }

        this.isReady = true;
    };

    applyDisplayRouter =(props: any) => {
        const selectItems = props[this.qsName.selectItems];
        if (isNotEmpty(selectItems)) {
            this.tableTS.syncState.selectIndex = getArrayQueryString(selectItems, Number);
            // console.debug(this.tableTS.syncState.selectIndex);
        }
    }

    routerPush = async () => {
        const query = {
            ...this.vm.$route.query,
            [this.qsName.sortBy]: this.tableTS.syncState.sortBy,
            [this.qsName.sortDesc]: String(this.tableTS.syncState.sortDesc),
            [this.qsName.filters]: this.tableTS.querySearch.tags.value?.map(t => makeSearchText(t.key, t.operator, t.value)),
            [this.qsName.thisPage]: this.tableTS.syncState.thisPage,
            [this.qsName.pageSize]: this.tableTS.syncState.pageSize,
            [this.qsName.selectItems]: this.tableTS.syncState.selectIndex,
        };
        if (!query[this.qsName.sortBy]) {
            delete query[this.qsName.sortDesc];
        }
        await pushRouterQuery(this.vm, query);
    }

    getData = async (resetThisPage = false) => {
        if (this.isReady) {
            await this.defaultGetData(resetThisPage);
            await this.routerPush();
        }
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
        initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
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
        private keyPath: readonlyRefArg<string>,
        private id: readonlyRefArg<string>,
        initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
    ) {
        super(url, undefined, undefined, undefined, initData, initSyncData);
        this.apiState.extraParams = computed(() => ({
            key_path: isRef(this.keyPath) ? this.keyPath.value : this.keyPath,
            [idKey]: isRef(this.id) ? this.id.value : this.id,
        }));
    }
}


export class QuerySearchTableAPI<initData = any, initSyncData = any,
    T extends QuerySearchTableToolSet<initData, initSyncData> = QuerySearchTableToolSet<initData, initSyncData>> extends BaseTableAPI<initData, initSyncData, T> {
    constructor(
        url: string, only?: string[], extraParams?: object, fixSearchQuery: SearchQueryType[] = [],
        initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData,
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
    ) {
        super(url, only, extraParams, fixSearchQuery);
        this.tableTS = new QuerySearchTableToolSet(acHandlerMeta.handlerClass, acHandlerMeta.args, initData, initSyncData) as T;
        watch(this.tableTS.querySearch.tags, (tags, preTags) => {
            if (tags !== preTags) {
                this.getData(false);
            }
        });
    }

    protected queryTags: Ref<readonly SearchQueryType[]> = computed(() => {
        // @ts-ignore
        const fix = (this.apiState.fixSearchQuery as SearchQueryType[]);
        const sq: SearchQueryType[] = this.tableTS.querySearch.tags.value;
        return [...fix, ...sq];
    });

    protected paramQuery = computed(() => defaultQuery(
        (this.tableTS.syncState.thisPage as number), (this.tableTS.syncState.pageSize as number),
        this.tableTS.syncState.sortBy, this.tableTS.syncState.sortDesc, undefined,
        this.queryTags.value, undefined, this.apiState.only,
    ));


    resetAll = () => {
        this.defaultReset();
        this.tableTS.querySearch.state.searchText = '';
    };
}

// export class TabQuerySearchTableAPI<initData = any, initSyncData = any,
//     T extends QuerySearchTableToolSet<initData, initSyncData> = QuerySearchTableToolSet<initData, initSyncData>> extends QuerySearchTableAPI<initData, initSyncData> {
//     public constructor(
//         url: string, only?: string[], extraParams?: object, fixSearchQuery: SearchQueryType[] = [],
//         initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
//         acHandlerMeta: ACHandlerMeta = defaultACHandler,
//         isShow: forceRefArg<boolean>,
//     ) {
//         super(url, only, extraParams, fixSearchQuery, initData, initSyncData, acHandlerMeta);
//         this.isShow = isShow;
//         onMounted(() => {
//             watch([isShow], (origin, before) => {
//                 let show;
//                 let preShow;
//                 if (origin) {
//                     show = origin[0];
//                 }
//                 if (before) {
//                     preShow = before[0];
//                 }
//                 if (show && (show !== preShow)) {
//                     this.getData();
//                 }
//             });
//         });
//     }
// }
