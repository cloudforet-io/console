import { watch } from '@vue/composition-api';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { baseAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { ListType, QueryAPI } from '@/lib/fluent-api';
import {
    QuerySearchGridLayoutToolSet,
    SearchGridLayoutToolSet,
    ToolboxGridLayoutToolSet,
} from '@/components/organisms/layouts/toolbox-grid-layout/toolset';


export abstract class BaseGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends ToolboxGridLayoutToolSet<initData, initSyncData> = ToolboxGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    gridTS: T;


    protected constructor(action: action) {
        super(action);
        this.gridTS = new ToolboxGridLayoutToolSet<initData, initSyncData>() as T;
    }

    protected getDefaultAction(): action {
        return this.action
            .setThisPage(this.gridTS.syncState.thisPage as number)
            .setPageSize(this.gridTS.syncState.pageSize as number);
    }

    getAction = () => this.getDefaultAction()

    getData = async () => {
        this.gridTS.syncState.loading = true;
        this.gridTS.state.items = [];
        try {
            const res = await this.getAction().execute();
            this.gridTS.state.items = res.data.results;
            this.gridTS.setAllPage(res.data.total_count);
        } catch (e) {
            this.gridTS.state.items = [];
            this.gridTS.state.allPage = 1;
        }
        this.gridTS.syncState.loading = false;
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
    handlerClass: typeof baseAutocompleteHandler;
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
    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
    ) {
        super(action);
        this.gridTS = new QuerySearchGridLayoutToolSet(acHandlerMeta.handlerClass, acHandlerMeta.args, initData, initSyncData) as T;
        watch(this.gridTS.querySearch.tags, async (tags, preTags) => {
            if (tags !== preTags) {
                await this.getData();
            }
        });
    }

    getAction = () => this.getDefaultAction().setFilter(...this.gridTS.querySearch.tags.value);

    resetAll = () => {
        this.defaultReset();
        this.gridTS.querySearch.state.searchText = '';
    };
}
