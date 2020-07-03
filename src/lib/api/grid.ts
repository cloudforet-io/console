import { Ref, ref, watch } from '@vue/composition-api';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { BaseAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { ListType, QueryAPI } from '@/lib/fluent-api';
import {
    QuerySearchGridLayoutToolSet,
    SearchGridLayoutToolSet,
    ToolboxGridLayoutToolSet,
} from '@/components/organisms/layouts/toolbox-grid-layout/toolset';
import { AxiosResponse } from 'axios';
import { QuerySearchTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';
import { getArrayQueryString, pushRouterQuery, RouterAPIToolsetInterface } from '@/lib/router-query-string';
import Vue from 'vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import _ from 'lodash';
import { isNotEmpty } from '@/lib/util';
import { makeSearchQuery, makeSearchText } from '@/components/organisms/search/query-search-bar/toolset';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';

export abstract class BaseGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends ToolboxGridLayoutToolSet<initData, initSyncData> = ToolboxGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    gridTS: T;

    totalCount: Ref<number>;

    protected constructor(action: action) {
        super(action);
        this.totalCount = ref(0);
        this.gridTS = new ToolboxGridLayoutToolSet<initData, initSyncData>() as T;
    }

    protected getDefaultAction(): action {
        return this.action
            .setThisPage(this.gridTS.syncState.thisPage as number)
            .setPageSize(this.gridTS.syncState.pageSize as number);
    }

    getAction = () => this.getDefaultAction()

    defaultGetData = async (resetThisPage) => {
        if (resetThisPage) {
            this.gridTS.syncState.thisPage = 1;
        }
        this.gridTS.syncState.loading = true;
        this.gridTS.state.items = [];
        // let res: PromiseLike<AxiosResponse<any>>|any = null;
        try {
            const res = await this.getAction().execute();
            this.gridTS.state.items = res.data.results;
            this.totalCount.value = res.data.total_count;
            this.gridTS.setAllPage(res.data.total_count);
        } catch (e) {
            this.gridTS.state.items = [];
            this.gridTS.state.allPage = 1;
        }
        this.gridTS.syncState.loading = false;
        // return res;
    };

    getData = async (resetThisPage = false) => {
        await this.defaultGetData(resetThisPage);
    };

    protected defaultReset = () => {
        this.gridTS.state.allPage = 1;
        this.gridTS.state.items = [];
        this.gridTS.syncState.thisPage = 1;
    };

    resetAll = () => {
        this.defaultReset();
    }
}
export class SearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchGridLayoutToolSet<initData, initSyncData> = SearchGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends BaseGridFluentAPI<parameter, resp, action> {
    gridTS: T;

    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(action);
        this.gridTS = new SearchGridLayoutToolSet(initData, initSyncData) as T;
    }

    // @ts-ignore
    getSearchTableDefaultAction: () => action = () => this.getDefaultAction().setKeyword(this.gridTS.searchText.value);

    getAction = () => this.getSearchTableDefaultAction();

    resetAll = () => {
        this.defaultReset();
        this.gridTS.searchText.value = '';
    };
}

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
export class QuerySearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchGridLayoutToolSet<initData, initSyncData> = QuerySearchGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends BaseGridFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    initToolset = (initData, initSyncData, acHandlerMeta, isShow) => {
        this.gridTS = new QuerySearchGridLayoutToolSet(acHandlerMeta.handlerClass, acHandlerMeta.args, initData, initSyncData) as T;
        watch(this.gridTS.querySearch.tags, async (tags, preTags) => {
            if (isShow.value && tags !== preTags) {
                await this.getData(true);
            }
        });
    }

    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
        isShow: any = ref(true),
        initLazy = false,
    ) {
        super(action);
        if (!initLazy) {
            this.initToolset(initData, initSyncData, acHandlerMeta, isShow);
        }
    }

    getAction = () => this.getDefaultAction().setFilter(...this.gridTS.querySearch.tags.value);

    resetAll = () => {
        this.defaultReset();
        this.gridTS.querySearch.state.searchText = '';
    };
}
interface QuerySearchQSNameType{
    search: string;
    filters: string;
    sortBy: string;
    sortDesc: string;
    thisPage: string;
    pageSize: string;
}
export enum DefaultQSGridQSPropsName {
    search = 'g_s',
    filters= 'g_f',
    sortBy='g_sb',
    sortDesc= 'g_sd',
    thisPage= 'g_p',
    pageSize= 'g_ps',
}

export const makeQSGridQSProps = (names: QuerySearchQSNameType) => ({
    [names.search]: {
        type: String,
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
});

export class RouteSearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchGridLayoutToolSet<initData, initSyncData> = SearchGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends SearchGridFluentAPI<parameter, resp, initData, initSyncData, T, action> implements RouterAPIToolsetInterface {
    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        isShow: any = ref(true),
        public vm: Vue|ComponentInstance,
        public qsName: QuerySearchQSNameType = DefaultQSGridQSPropsName,
        public isReady = false,
        initLazy = false,
    ) {
        super(action, initData, initSyncData);

        watch(() => this.gridTS.syncState.thisPage, async (aft, bef) => {
            if (!_.isEqual(aft, bef)) {
                await this.routerPush();
            }
        });
    }

    applyAPIRouter = (props: any) => {
        if (isNotEmpty(props[this.qsName.pageSize])) {
            this.gridTS.syncState.pageSize = Number(props[this.qsName.pageSize]);
        }
        if (isNotEmpty(props[this.qsName.thisPage])) {
            this.gridTS.syncState.thisPage = Number(props[this.qsName.thisPage]);
        }
        const search = props[this.qsName.search];
        if (isNotEmpty(search)) {
            this.gridTS.searchText.value = search;
        }
        this.isReady = true;
    };

    routerPush = async () => {
        const query = {
            ...this.vm.$route.query,
            [this.qsName.search]: this.gridTS.searchText.value,
            [this.qsName.thisPage]: this.gridTS.syncState.thisPage,
            [this.qsName.pageSize]: this.gridTS.syncState.pageSize,
        };
        if (!query[this.qsName.sortBy]) {
            delete query[this.qsName.sortDesc];
        }
        await pushRouterQuery(this.vm, query);
    }

    getData = async (resetThisPage = false) => {
        if (this.isReady) {
            // if (resetThisPage) {
            //     this.gridTS.syncState.thisPage = 1;
            // }
            await this.defaultGetData(resetThisPage);
            await this.routerPush();
        }
    };
}

export const DefaultQSGridQSProps = makeQSGridQSProps(DefaultQSGridQSPropsName);
export class RouteQuerySearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchGridLayoutToolSet<initData, initSyncData> = QuerySearchGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends QuerySearchGridFluentAPI<parameter, resp, initData, initSyncData, T, action> implements RouterAPIToolsetInterface {
    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
        isShow: any = ref(true),
        public vm: Vue|ComponentInstance,
        public qsName: QuerySearchQSNameType = DefaultQSGridQSPropsName,
        public isReady = false,
        initLazy = false,
    ) {
        super(action, initData, initSyncData, acHandlerMeta, true);
        if (!initLazy) {
            this.initToolset(initData, initSyncData, acHandlerMeta, isShow);
        }
        watch(() => this.gridTS.syncState.thisPage, async (aft, bef) => {
            if (!_.isEqual(aft, bef)) {
                await this.routerPush();
            }
        });
    }

    applyAPIRouter = (props: any) => {
        if (isNotEmpty(props[this.qsName.pageSize])) {
            this.gridTS.syncState.pageSize = Number(props[this.qsName.pageSize]);
        }
        if (isNotEmpty(props[this.qsName.thisPage])) {
            this.gridTS.syncState.thisPage = Number(props[this.qsName.thisPage]);
        }
        const filters = props[this.qsName.filters];
        if (isNotEmpty(filters)) {
            this.gridTS.querySearch.tags.value = getArrayQueryString(filters, makeSearchQuery);
        }
        this.isReady = true;
    };

    routerPush = async () => {
        const query = {
            ...this.vm.$route.query,
            [this.qsName.filters]: this.gridTS.querySearch.tags.value?.map(t => makeSearchText(t.key, t.operator, t.value)),
            [this.qsName.thisPage]: this.gridTS.syncState.thisPage,
            [this.qsName.pageSize]: this.gridTS.syncState.pageSize,
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
