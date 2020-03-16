/* eslint-disable camelcase */
import Vue from 'vue';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    computed, getCurrentInstance, isRef, onMounted, reactive, Ref, watch,
} from '@vue/composition-api';
import {
    QuerySearchTableToolSet,
    SearchTableToolSet,
    ToolboxTableToolSet,
} from '@/components/organisms/tables/toolbox-table/toolset';
import { BaseApiState, transformHandlerType, getDataAPI } from '@/lib/api/toolset';
import { forceRefArg, readonlyRefArg } from '@/lib/type';
import {
    baseAutocompleteHandler,
    SearchQueryType,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { ApiQuery, defaultQuery } from '@/lib/api/query';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';

export abstract class BaseTableAPI<
        initData = any,
        initSyncData = any,
        T extends ToolboxTableToolSet<initData, initSyncData> = ToolboxTableToolSet<initData, initSyncData>
    > extends getDataAPI {
    public tableTS: T;

    public vm: Vue;

    public apiState: UnwrapRef<BaseApiState>


    protected constructor(
        url: readonlyRefArg<string>,
        only: readonlyRefArg<string[]> = [],
        extraParams: readonlyRefArg<any> = {},
        fixSearchQuery: SearchQueryType[] = [],
        transformHandler:transformHandlerType|null = null,
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
                    console.debug(e);
                }
            }
            return result;
        });
        return resp;
    };


    public getData = async () => {
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

    public resetAll = () => {
        this.defaultReset();
    }
}

export class SearchTableAPI<initData = any, initSyncData = any,
    T extends SearchTableToolSet<initData, initSyncData> = SearchTableToolSet<initData, initSyncData>> extends BaseTableAPI<initData, initSyncData, T> {
    public constructor(
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

    public resetAll = () => {
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

export class TabSearchTableAPI<initData = any, initSyncData = any> extends SearchTableAPI<initData, initSyncData> {
    protected isShow: forceRefArg<boolean>;

    public constructor(
        url: readonlyRefArg<string>,
        extraParams: forceRefArg<any>,
        fixSearchQuery: SearchQueryType[] = [],
        initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
        public dataSource: DataSource[] = [],
        isShow: forceRefArg<boolean>,
    ) {
        super(
            url,
            undefined, // sub api can't support only query
            extraParams,
            fixSearchQuery,
        );
        this.tableTS = new SearchTableToolSet(initData, initSyncData);
        this.isShow = isShow;
        const params = computed(() => this.apiState.extraParams);
        onMounted(() => {
            watch([isShow, params], (origine, before) => {
                let show;
                let parm;
                let preShow;
                let preParm = [null, null, null, null];
                if (origine) {
                    show = origine[0];
                    parm = origine[1];
                }
                if (before) {
                    preShow = before[0];
                    preParm = before[1];
                }

                if (show && parm && (show !== preShow || parm !== preParm)) {
                    this.getData();
                }
            });
        });
    }
}

const defaultAdminDataSource = [
    { name: 'Resource Type', key: 'resource_type' },
    { name: 'Resource ID', key: 'resource_id' },
    { name: 'Resource Name', key: 'name' },
    {
        name: 'labels', key: 'labels', view_type: 'list', view_option: { item: { view_type: 'badge' } },
    },
    { name: 'User ID', key: 'user_info.user_id' },
    { name: 'Name', key: 'user_info.name' },
    { name: 'Email', key: 'user_info.email' },
];

export class AdminTableAPI<initData, initSyncData> extends TabSearchTableAPI<initData, initSyncData> {
    public constructor(
        url: readonlyRefArg<string>,
        extraParams: forceRefArg<any>,
        fixSearchQuery: SearchQueryType[] = [],
        initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
        public dataSource: DataSource[] = defaultAdminDataSource,
        isShow: forceRefArg<boolean>,
    ) {
        super(url, extraParams, fixSearchQuery, initData, initSyncData, dataSource, isShow);
    }
}

export const MockAdminTableAPI = () => new AdminTableAPI('', computed(() => ({})), [], undefined, undefined, [], computed(() => false));

export class SubDataAPI<initData = any, initSyncData = any> extends SearchTableAPI<initData, initSyncData> {
    // @ts-ignore
    public constructor(
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

const defaultHistoryDataSource = [
    { name: 'Update By', key: 'updated_by' },
    { name: 'Key', key: 'key' },
    {
        name: 'Update At',
        key: 'updated_at',
        view_type: 'datetime',
        view_option: {
            source_type: 'timestamp',
            source_format: 'seconds',
        },
    },

];

export class HistoryAPI<initData = any, initSyncData = any> extends TabSearchTableAPI<initData, initSyncData> {
    // @ts-ignore
    public constructor(
        url: readonlyRefArg<string>,
        idKey: string,
        private id: readonlyRefArg<string>,
        initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
        public dataSource: DataSource[] = defaultHistoryDataSource,
        isShow: forceRefArg<boolean>,
    ) {
        super(url, computed(() => ({})), undefined, initData, initSyncData, dataSource, isShow);
        this.apiState.extraParams = computed(() => ({
            key_path: 'collection_info.update_history',
            [idKey]: isRef(this.id) ? this.id.value : this.id,
        }));
    }
}

export const MockHistoryAPI = () => new HistoryAPI('', '', '', undefined, undefined, [], computed(() => false));

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

export class QuerySearchTableAPI<initData = any, initSyncData = any,
    T extends QuerySearchTableToolSet<initData, initSyncData> = QuerySearchTableToolSet<initData, initSyncData>> extends BaseTableAPI<initData, initSyncData, T> {
    public constructor(
        url: string, only?: string[], extraParams?: object, fixSearchQuery: SearchQueryType[] = [],
        initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{},
        acHandlerMeta: ACHandlerMeta = defaultACHandler,
    ) {
        super(url, only, extraParams, fixSearchQuery);
        this.tableTS = new QuerySearchTableToolSet(acHandlerMeta.handlerClass, acHandlerMeta.args, initData, initSyncData) as T;
        watch(this.tableTS.querySearch.tags, (tags, preTags) => {
            if (tags !== preTags) {
                this.getData();
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


    public resetAll = () => {
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