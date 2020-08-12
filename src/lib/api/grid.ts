import { Ref, ref, watch } from '@vue/composition-api';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { ActionAPI, ListType, QueryAPI } from '@/lib/fluent-api';
import {
    QuerySearchGridLayoutToolSet,
    SearchGridLayoutToolSet,
    ToolboxGridLayoutToolSet,
} from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.toolset';
import {
    ACHandlerMeta,
    defaultACHandler,
    getQueryItemsToFilterItems,
} from '@/lib/api/query-search';
import { StatTopicQueryAPI } from '@/lib/fluent-api/statistics/toolset';

export abstract class BaseGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends ToolboxGridLayoutToolSet<initData, initSyncData> = ToolboxGridLayoutToolSet<initData, initSyncData>,
    action extends ActionAPI<any, any> = ActionAPI<parameter, resp>,
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    gridTS: T;

    totalCount: Ref<number>;

    protected constructor(action: action) {
        super(action);
        this.totalCount = ref(0);
        this.gridTS = new ToolboxGridLayoutToolSet<initData, initSyncData>() as T;
    }

    protected abstract getDefaultAction(): action

    // protected getDefaultAction(): action {
    //     return this.action
    //         .setThisPage(this.gridTS.syncState.thisPage as number)
    //         .setPageSize(this.gridTS.syncState.pageSize as number);
    // }

    getAction = () => this.getDefaultAction()

    defaultGetData = async (resetThisPage) => {
        if (resetThisPage) {
            this.gridTS.syncState.thisPage = 1;
        }
        this.gridTS.syncState.loading = true;
        // let res: PromiseLike<AxiosResponse<any>>|any = null;
        try {
            const res = await this.getAction().execute();
            this.gridTS.state.items = res.data.results;
            this.totalCount.value = res.data.total_count;
            this.gridTS.setAllPage(res.data.total_count);
        } catch (e) {
            this.gridTS.state.items = [];
            this.gridTS.state.allPage = 1;
        } finally {
            this.gridTS.syncState.loading = false;
        }

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

    protected getDefaultAction(): action {
        return (this.action as QueryAPI<parameter, resp>)
            .setThisPage(this.gridTS.syncState.thisPage as number)
            .setPageSize(this.gridTS.syncState.pageSize as number) as action;
    }

    // @ts-ignore
    getSearchTableDefaultAction: () => action = () => this.getDefaultAction().setKeyword(this.gridTS.searchText.value);

    getAction = () => this.getSearchTableDefaultAction();

    resetAll = () => {
        this.defaultReset();
        this.gridTS.searchText.value = '';
    };
}

export class StatSearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchGridLayoutToolSet<initData, initSyncData> = SearchGridLayoutToolSet<initData, initSyncData>,
    action extends StatTopicQueryAPI<any, any> = StatTopicQueryAPI<parameter, resp>,
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

    protected getDefaultAction(): action {
        return (this.action as StatTopicQueryAPI<parameter, resp>)
            .setStart(((this.gridTS.syncState.thisPage - 1) * this.gridTS.syncState.pageSize) + 1)
            .setLimit(this.gridTS.syncState.pageSize as number) as action;
    }

    getSearchTableDefaultAction: () => action = () => this.getDefaultAction()// .setKeyword(this.gridTS.searchText.value);

    getAction = () => this.getSearchTableDefaultAction();

    resetAll = () => {
        this.defaultReset();
        this.gridTS.searchText.value = '';
    };
}

export class StatQuerySearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchGridLayoutToolSet<initData, initSyncData> = QuerySearchGridLayoutToolSet<initData, initSyncData>,
    action extends StatTopicQueryAPI<parameter, resp> = StatTopicQueryAPI<parameter, resp>,
    > extends BaseGridFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    initToolset = (initData, initSyncData, acHandlerMeta: ACHandlerMeta) => {
        this.gridTS = new QuerySearchGridLayoutToolSet(acHandlerMeta.keyItems, acHandlerMeta.valueHandlerMap, initData, initSyncData) as T;
        watch(this.gridTS.querySearch.tags, async (tags, preTags) => {
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

    protected getDefaultAction(): action {
        return (this.action as StatTopicQueryAPI<parameter, resp>)
            .setStart(this.gridTS.syncState.thisPage as number)
            .setLimit(this.gridTS.syncState.pageSize as number) as action;
    }

    getAction = () => {
        const items = getQueryItemsToFilterItems(this.gridTS.querySearch.tags.value, this.gridTS.querySearch.state.keyItems);
        return this.getDefaultAction()
            .setFilter(...items.and)
            .setFilterOr(...items.or);
    };

    resetAll = () => {
        this.defaultReset();
        this.gridTS.querySearch.syncState.value = '';
    };
}

export class QuerySearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends QuerySearchGridLayoutToolSet<initData, initSyncData> = QuerySearchGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<parameter, resp> = QueryAPI<parameter, resp>,
    > extends BaseGridFluentAPI<parameter, resp, initData, initSyncData, T, action> {
    initToolset = (initData, initSyncData, acHandlerMeta: ACHandlerMeta) => {
        this.gridTS = new QuerySearchGridLayoutToolSet(acHandlerMeta.keyItems, acHandlerMeta.valueHandlerMap, initData, initSyncData) as T;
        watch(this.gridTS.querySearch.tags, async (tags, preTags) => {
            if (tags !== preTags) {
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

    protected getDefaultAction(): action {
        return (this.action as QueryAPI<parameter, resp>)
            .setThisPage(this.gridTS.syncState.thisPage as number)
            .setPageSize(this.gridTS.syncState.pageSize as number) as action;
    }

    getAction = () => {
        const items = getQueryItemsToFilterItems(this.gridTS.querySearch.tags.value, this.gridTS.querySearch.state.keyItems);
        return this.getDefaultAction()
            .setFilter(...items.and)
            .setFilterOr(...items.or);
    };

    resetAll = () => {
        this.defaultReset();
        this.gridTS.querySearch.syncState.value = '';
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

export const DefaultQSGridQSProps = makeQSGridQSProps(DefaultQSGridQSPropsName);
