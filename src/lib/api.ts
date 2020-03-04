/* eslint-disable camelcase */
import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import _ from 'lodash';
import {
    computed, getCurrentInstance, reactive, Ref, ref, watch, isRef,
} from '@vue/composition-api';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

// @ts-ignore
// eslint-disable-next-line import/extensions
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
// eslint-disable-next-line import/no-cycle
import {
    baseAutocompleteHandler,
    getKeys,
    getSuggest,
    SearchQueryType,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
// eslint-disable-next-line import/no-cycle
import {
    QuerySearchTableToolSet,
    SearchTableToolSet,
    ToolboxTableToolSet,
} from '@/components/organisms/tables/toolbox-table/toolset';

import construct = Reflect.construct;
type RefArgs<T> = Ref<T>|Ref<Readonly<T>>
type cnaRefArgs<T> = T|RefArgs<T>
type readonlyArgs<T> = T|Readonly<T>
type readonlyRefArg<T> = readonlyArgs<cnaRefArgs<T>>

type forceRefArg<T> = readonlyArgs<RefArgs<T>>

class APIError extends Error {
    public status: number;

    public code:string;

    public axiosError:AxiosError;

    constructor(axiosError:AxiosError) {
        super();

        // @ts-ignore
        if (Error.captureStackTrace) {
            // @ts-ignore
            Error.captureStackTrace(this, APIError);
        }

        this.name = 'APIError';
        this.status = 500;
        this.code = 'ERROR_UNKNOWN';
        this.axiosError = axiosError;

        if (axiosError.response) {
            this.status = axiosError.response.status;

            if (axiosError.response.data.error) {
                this.message = axiosError.response.data.error.message;
                this.code = axiosError.response.data.error.code;
            } else {
                this.message = axiosError.response.statusText;
            }
        } else {
            this.message = axiosError.message;
        }
    }
}


const refreshUrl = '/identity/token/refresh';

export class ApiInstance {
    public instance:AxiosInstance;

    protected refreshInstance :AxiosInstance;


    public constructor(baseURL:string, protected vm:any) {
        const axiosOptions = {
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        this.instance = axios.create(axiosOptions);
        this.refreshInstance = axios.create(axiosOptions);


        if (this.vm) {
            this.setRefreshRequestInterceptor((request) => {
                if (this.vm.$ls.user.state.isSignedIn) {
                    request.headers.Authorization = `Bearer ${this.vm.$ls.user.state.refreshToken}`;
                }
                return request;
            });
            this.setRequestInterceptor((request) => {
                if (this.vm.$ls.user.state.isSignedIn && request.url !== '/identity/domain/list') {
                    request.headers.Authorization = `Bearer ${this.vm.$ls.user.state.accessToken}`;
                }
                return request;
            });
            const refreshAuthLogic = failedRequest => this.refreshInstance.post(refreshUrl).then((resp) => {
                console.debug('request refresh token');
                this.vm.$ls.user.setToken(resp.data.refresh_token, resp.data.access_token);
                failedRequest.response.config.headers.Authorization = `Bearer ${this.vm.$ls.user.state.accessToken}`;
                return Promise.resolve();
            }, (error) => {
                console.debug('fail refresh', error);
                this.vm.$ls.logout(vm);
                return Promise.reject();
            });

            createAuthRefreshInterceptor(this.instance, refreshAuthLogic);
        }
    }

    protected setRefreshRequestInterceptor(handler:(request:AxiosRequestConfig)=>AxiosRequestConfig):void {
        this.refreshInstance.interceptors.request.use(handler);
    }

    protected setRequestInterceptor(handler:(request:AxiosRequestConfig)=>AxiosRequestConfig):void {
        this.instance.interceptors.request.use(handler);
    }

    protected setResponseInterceptor(responseHandler:(response:AxiosResponse)=>AxiosResponse|Promise<AxiosResponse>, errorHandler?:(error:AxiosError)=>AxiosError|Promise<AxiosError>):void {
        this.instance.interceptors.response.use(responseHandler, errorHandler);
    }
}

export const operatorMap = Object.freeze({
    '': 'contain_in', // merge operator
    '!': 'not_contain', // merge operator
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    '=': 'in', // merge operator
    '!=': 'not_in', // merge operator
    $: 'regex',
});

const mergeOperatorSet = new Set(['contain_in', 'not_contain_in', 'in', 'not_in']);

interface Sort {
    key:string;
    desc?:boolean;
}

interface Page {
    start:number;
    limit?:number;
}

interface Filter{
    k?:string;
    o?:string;
    v?:any;
    key?:string;
    operation?:string;
    value?:any;
}

interface ApiQuery {
    page?:Page;
    sort?:Sort;
    keyword?:string;
    filter?:Filter[];
    only?:readonlyArgs<string[]>;
}

type ValueFormatter = (string, any)=>string|number|Array<string|number>;

/**
 * @name defaultQuery
 * @description make default query format
 * @param thisPage
 * @param pageSize
 * @param sortBy
 * @param sortDesc
 * @param searchText
 * @param searchQueries {Array<SearchQueryType>}
 * @param valueFormatter <(key,value)=>value>
 * @param only
 * @returns {{page: {start: number, limit: *}}}
 */
export const defaultQuery = (
    thisPage:number, pageSize:number, sortBy?:string, sortDesc?:boolean,
    searchText?:string, searchQueries?:SearchQueryType[]|readonly SearchQueryType[], valueFormatter?:ValueFormatter, only?:string[]|readonly string[],
):ApiQuery => {
    const query:ApiQuery = {
        page: {
            start: ((thisPage - 1) * pageSize) + 1,
            limit: pageSize,
        },
    };
    if (sortBy) {
        query.sort = {
            key: sortBy,
            desc: sortDesc,
        };
    }
    if (only && only.length > 0) {
        query.only = only;
    }
    if (searchText) {
        query.keyword = searchText || '';
    }
    if (searchQueries && searchQueries.length > 0) {
        const filter:Filter[] = [];

        // eslint-disable-next-line camelcase
        const mergeOpQuery:{[propName: string]: Filter;} = {};
        searchQueries.forEach((q) => {
            const op = operatorMap[q.operator];
            const value = valueFormatter ? valueFormatter(q.key, q.value) : q.value;
            if (mergeOperatorSet.has(op)) {
                const prefix = `${q.key}:${op}`;
                if (mergeOpQuery[prefix]) {
                    mergeOpQuery[prefix].v.push(value);
                } else {
                    mergeOpQuery[prefix] = {
                        k: q.key,
                        v: [value],
                        o: op,
                    };
                }
            } else {
                filter.push({
                    k: q.key,
                    v: value,
                    o: op,
                });
            }
        });
        // eslint-disable-next-line camelcase
        if (!_.isEmpty(filter) || !_.isEmpty(mergeOpQuery)) { query.filter = [...filter, ...Object.values(mergeOpQuery)]; }
    }
    return query;
};

/**
 * make value autocomplete query
 * @param key
 * @param value
 * @param itemLimit
 * @param sortBy
 * @param sortDesc
 * @return {{page: {start: number, limit: *}}}
 */
export const autoCompleteQuery = (searchQuery, itemLimit?:number, sortBy?:string, sortDesc?:boolean) => {
    const query:ApiQuery = {
        page: { start: 1, limit: itemLimit },
        only: [searchQuery.key],
    };
    if (sortBy) {
        query.sort = { key: sortBy, desc: sortDesc };
    }

    if (searchQuery.value) {
        query.filter = [{
            k: searchQuery.key,
            v: searchQuery.value,
            o: 'contain',
        }];
    }
    return query;
};


export interface HttpInstance {
    $http:AxiosInstance
}

export abstract class DynamicAPI {
    public abstract vm:ComponentInstance ;

    get $http() { return (this.vm as HttpInstance).$http; }

    protected abstract requestData(data?:any):Promise<AxiosResponse<any>> ;

    public abstract getData():void;
}


type AutoCompleteData = [string, any[]];
type ACFunction = ()=>AutoCompleteData
interface ACHandlerMap {
    key: ACFunction[];
    value:ACFunction[];

}

export interface QSTableACHandlerArgs{
    keys:string[];
    suggestKeys:string[];
}

export class QuerySearchTableACHandler extends baseAutocompleteHandler {
    constructor(args:QSTableACHandlerArgs = { keys: [], suggestKeys: [] }) {
        super();
        (this.handlerMap as ACHandlerMap) = {
            key: [getKeys(args.keys) as ACFunction, getSuggest(args.suggestKeys) as ACFunction],
            value: [],
        };
    }
}


interface BaseApiState{
    url:readonlyArgs<string>;
    only:readonlyArgs<string[]>;
    extraParams:readonlyArgs<any>;
    fixSearchQuery:SearchQueryType[];
}

export abstract class BaseTableAPI extends DynamicAPI {
    public tableTS:ToolboxTableToolSet;

    public vm:ComponentInstance ;

    public apiState:UnwrapRef<BaseApiState>


    protected constructor(url:readonlyRefArg<string>, only:readonlyRefArg<string[]> = [], extraParams:readonlyRefArg<any> = {}, fixSearchQuery : SearchQueryType[] = []) {
        super();
        // @ts-ignore
        this.vm = getCurrentInstance();
        this.apiState = reactive({
            url,
            only,
            fixSearchQuery, // default fix query
            extraParams, // for api extra parameters
        });
        this.tableTS = new ToolboxTableToolSet();
    }

    protected abstract paramQuery:Ref<ApiQuery>;

    protected requestData=async () => {
        const params = {
            query: this.paramQuery.value,
            ...this.apiState.extraParams,
        };
        const res = await this.$http.post(this.apiState.url, params);
        return res;
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

export class SearchTableAPI extends BaseTableAPI {
    public tableTS:SearchTableToolSet;

    public constructor(
        url:readonlyRefArg<string>,
        only:readonlyRefArg<string[]> = [],
        extraParams:readonlyRefArg<any> = {},
        fixSearchQuery : SearchQueryType[] = [],
        initData:object = {}, initSyncData:object = {},
    ) {
        super(url, only, extraParams, fixSearchQuery);
        this.tableTS = new SearchTableToolSet(initData, initSyncData);
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
    name:string;
    key:string;
    view_type?:string;
    view_option?:any;

}


export class TabSearchTableAPI extends SearchTableAPI {
    protected isShow: forceRefArg<boolean>;

    public constructor(
        url:readonlyRefArg<string>,
        extraParams:forceRefArg<any>,
        fixSearchQuery : SearchQueryType[] = [],
        initData:object = {}, initSyncData:object = {},
        public dataSource:DataSource[] = [],
        isShow : forceRefArg<boolean>,
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
        watch([this.isShow, params], ([show, parm], [preShow, preParm]) => {
            if (show && parm && (show !== preShow || parm !== preParm)) {
                this.getData();
            }
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
export class AdminTableAPI extends TabSearchTableAPI {
    public constructor(
        url:readonlyRefArg<string>,
        extraParams:forceRefArg<any>,
        fixSearchQuery : SearchQueryType[] = [],
        initData:object = {},
        initSyncData:object = {},
        public dataSource:DataSource[] = defaultAdminDataSource,
        isShow : forceRefArg<boolean>,
    ) {
        super(url, extraParams, fixSearchQuery, initData, initSyncData, dataSource, isShow);
    }
}


export class SubDataAPI extends SearchTableAPI {
    // @ts-ignore
    public constructor(
        url:readonlyRefArg<string>,
        idKey:string,
        private keyPath:readonlyRefArg<string>,
        private id:readonlyRefArg<string>,
        initData:object = {},
        initSyncData:object = {},
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

export class HistoryAPI extends TabSearchTableAPI {
    // @ts-ignore
    public constructor(
        url:readonlyRefArg<string>,
        idKey:string,
        private id:readonlyRefArg<string>,
        initData:object = {},
        initSyncData:object = {},
        public dataSource:DataSource[] = defaultHistoryDataSource,
        isShow : forceRefArg<boolean>,
    ) {
        super(url, computed(() => ({})), undefined, initData, initSyncData, dataSource, isShow);
        this.apiState.extraParams = computed(() => ({
            key_path: 'collection_info.update_history',
            [idKey]: isRef(this.id) ? this.id.value : this.id,
        }));
    }
}
export interface ACHandlerMeta {
    handlerClass:typeof baseAutocompleteHandler;
    args:any;
}
export const defaultACHandler:ACHandlerMeta = {
    handlerClass: QuerySearchTableACHandler,
    args: {
        keys: [],
        suggestKeys: [],
    },
};

export class QuerySearchTableAPI extends BaseTableAPI {
    public tableTS:QuerySearchTableToolSet;

    public constructor(
        url:string, only?:string[], extraParams?:object, fixSearchQuery : SearchQueryType[] = [],
        initData:object = {}, initSyncData:object = {},
        acHandlerMeta:ACHandlerMeta = defaultACHandler,
    ) {
        super(url, only, extraParams, fixSearchQuery);
        this.tableTS = new QuerySearchTableToolSet(acHandlerMeta.handlerClass, acHandlerMeta.args, initData, initSyncData);
        watch(this.tableTS.querySearch.tags, (tags, preTags) => {
            if (tags !== preTags) {
                this.getData();
            }
        });
    }

    protected queryTags:Ref<readonly SearchQueryType[]> = computed(() => {
        // @ts-ignore
        const fix = (this.apiState.fixSearchQuery as SearchQueryType[]);
        const sq:SearchQueryType[] = this.tableTS.querySearch.tags.value;
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
