/* eslint-disable camelcase */
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import _ from 'lodash';
import {
    computed, getCurrentInstance, reactive, Ref, ref, watch,
} from '@vue/composition-api';
// @ts-ignore
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { tagList } from '@/components/molecules/tags/Tag.vue';
// eslint-disable-next-line import/no-cycle
import {
    baseAutocompleteHandler,
    getKeys,
    getSuggest,
    SearchQueryType,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
// eslint-disable-next-line import/no-cycle
import { QuerySearchTableToolSet } from '@/components/organisms/tables/query-search-table/toolset';
import { SearchTableToolSet, ToolboxTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';

import construct = Reflect.construct;


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

class API {
    public instance:AxiosInstance|null;

    public constructor() { this.instance = null; }


    createAxiosInstance=(baseURL:string):void => {
        const axiosConfig = {
            baseURL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        this.instance = axios.create(axiosConfig);
    }

    setResponseInterceptor=(handlers:any):void => {
        (this.instance as AxiosInstance).interceptors.response.use(response => response, (e) => {
            const apiError = new APIError(e);

            if (apiError.status === 401) {
                // todo : run sign out && move login page
                if (handlers.authError) {
                    handlers.authError(apiError);
                }
            }

            return Promise.reject(apiError);
        });
    }


    init=(baseURL:string, handlers:any = {}):void => {
        if (!this.instance) {
            this.createAxiosInstance(baseURL);
            this.setResponseInterceptor(handlers);
        }
    }
}

export default new API();

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
    only?:string[];
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
    searchText?:string, searchQueries?:SearchQueryType[]|readonly SearchQueryType[], valueFormatter?:ValueFormatter, only?:string[],
) => {
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


interface TableState {
    items:any[];
    selectIndex?:number[];
    sortBy?:string;
    sortDesc?:boolean;
    only?:string[];
    pageSize: number;
    allPage: number;
    thisPage: number;
    searchText: string|null|undefined;
    fixSearchQuery?:SearchQueryType[]|Ref<SearchQueryType[]>;
    loading: boolean;
    acHandler?:Ref<QuerySearchTableACHandler>;
    extraParams?:object;
}

export const getAllPage = (total_count:number, pageSize:number):number => Math.ceil(total_count / pageSize) || 1;

export class SubDataAPI extends DynamicAPI {
    public state :TableState;

    private query:Ref<object>;

    constructor(public vm:HttpInstance, private url, private idKey:string, private keyPath:Ref<string>|Ref<Readonly<string>>, private id:Ref<string>) {
        super();
        this.state = reactive({
            items: [],
            pageSize: 15,
            allPage: 1,
            thisPage: 1,
            searchText: '',
            loading: false,
        });
        this.query = computed(() => (defaultQuery(
            this.state.thisPage, this.state.pageSize,
            undefined, undefined, this.state.searchText || '',
        )));
    }

    protected requestData = async (data?:any) => {
        const res = await this.$http.post(this.url, data);
        return res;
    };

    public getData = async () => {
        this.state.loading = true;
        this.state.items = [];

        const res = await this.requestData({
            query: this.query.value,
            key_path: this.keyPath.value,
            [this.idKey]: this.id.value,
        });
        this.state.items = res.data.results;
        this.state.allPage = getAllPage(res.data.total_count, this.state.pageSize);
        this.state.loading = false;
    }
}


export class MockSubDataAPI extends SubDataAPI {
    constructor(private items:any[]) {
        super(({ } as HttpInstance), '', '', ref(''), ref(''));
    }

    private fakeData=() => {
        this.state.items = this.items;
        this.state.allPage = 1;
        this.state.loading = false;
    }

    // @ts-ignore
    protected async requestData(data?:any) {
        setTimeout(() => {}, 1000);
        return { data: { results: this.items, total_count: 1 } } as AxiosResponse<any>;
    }
}

type AutoCompleteData = [string, any[]];
type ACFunction = ()=>AutoCompleteData
interface ACHandlerMap {
    key: ACFunction[];
    value:ACFunction[];

}

export class QuerySearchTableACHandler extends baseAutocompleteHandler {
    constructor(keys:string[] = [], suggestKeys:string[] = []) {
        super();
        (this.handlerMap as ACHandlerMap) = {
            key: [getKeys(keys) as ACFunction, getSuggest(suggestKeys) as ACFunction],
            value: [],
        };
    }
}


interface MockData {
    total_count: number;
    results: Array<any>;
}

export const getMockData = (data: any, timeout: number) => new Promise((resolve, reject) => {
    setTimeout(() => resolve(data), timeout);
});

export const callApi = ($http: AxiosInstance, url: string, params: object) => $http.post(url, params);

abstract class BaseTableAPI extends DynamicAPI {
    public tableTS:ToolboxTableToolSet;

    public vm:ComponentInstance ;

    public apiState:any


    protected constructor(url:string, only?:string[], extraParams?:object, fixSearchQuery : SearchQueryType[] = []) {
        super();
        // @ts-ignore
        this.vm = getCurrentInstance();
        this.apiState = reactive({
            url,
            only,
            fixSearchQuery: fixSearchQuery || [],
            extraParams: extraParams || {}, // for api extra parameters
        });
        this.tableTS = new ToolboxTableToolSet();
    }

    protected abstract paramQuery:Ref< defaultQuery>;

    protected requestData=async (data?:any) => {
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

        const res = await this.requestData();
        this.tableTS.state.items = res.data.results;
        this.tableTS.setAllPage(res.data.total_count);
        this.tableTS.syncState.loading = false;
    }
}

export class SearchTableAPI extends BaseTableAPI {
    public tableTS:SearchTableToolSet;

    protected constructor(url:string, only?:string[], extraParams?:object, fixSearchQuery : SearchQueryType[] = [], initData:object = {}, initSyncData:object = {}) {
        super(url, only, extraParams, fixSearchQuery);
        this.tableTS = new SearchTableToolSet(initData, initSyncData);
    }

    protected paramQuery = computed(() => defaultQuery((this.tableTS.syncState.thisPage as number), (this.tableTS.syncState.pageSize as number),
        this.tableTS.syncState.sortBy, this.tableTS.syncState.sortDesc, this.tableTS.searchText.value,
        this.apiState.fixSearchQuery, undefined, this.apiState.only))
}

export class BaseQuerySearchTableTSAPI extends QuerySearchTableToolSet {
    public apiState:any;

    public queryTags:Readonly<Ref<readonly SearchQueryType[]>>;

    public parent:HttpInstance;

    // eslint-disable-next-line class-methods-use-this
    get $http() {
        // @ts-ignore
        return this.parent.$http;
    }

    protected paramQuery:Ref<object>;

    public acState:any;

    public getData:Function;

    public resetAll:Function;


    // @ts-ignore
    constructor(url:string, keys?:string[], only?:string[], extraParams?:object, fixSearchQuery : SearchQueryType[] = [], initData:object = {}, initSyncData:object = {}, parent:HttpInstance) {
        const args = {
            keys: keys || [],
            suggestKeys: keys || [],
        };
        const argsOrders = ['keys', 'suggestKeys'];
        super(QuerySearchTableACHandler, args, argsOrders, initData, initSyncData);
        this.parent = parent;
        this.apiState = reactive({
            url,
            only,
            fixSearchQuery: fixSearchQuery || [],
            extraParams: extraParams || {}, // for api extra parameters
        });
        this.queryTags = computed(() => {
            const fix:SearchQueryType[] = this.apiState.fixSearchQuery;
            const sq:SearchQueryType[] = this.querySearch.tags.value;
            return [...fix, ...sq];
        });
        this.paramQuery = computed(() => (defaultQuery(
            (this.syncState.thisPage as number), (this.syncState.pageSize as number),
            this.syncState.sortBy, this.syncState.sortDesc, undefined,
            this.queryTags.value, undefined, this.apiState.only,
        )));
        this.getData = async () => {
            this.syncState.loading = true;
            this.state.items = [];
            this.syncState.selectIndex = [];

            try {
                const params = {
                    query: this.paramQuery.value,
                    ...this.apiState.extraParams,

                };
                const res = await this.$http.post(this.apiState.url, params);
                this.state.items = res.data.results;
                this.setAllPage(res.data.total_count);
            } catch (e) {
                console.debug('request fail', e);
            }

            this.syncState.loading = false;
        };

        watch(this.querySearch.tags, (tags, preTags) => {
            if (tags !== preTags) {
                this.getData();
            }
        });

        this.resetAll = () => {
            this.state.allPage = 1;
            this.state.items = [];
            this.syncState.thisPage = 1;
            this.syncState.selectIndex = [];
            this.syncState.sortBy = '';
            this.syncState.sortDesc = true;
            this.querySearch.state.searchText = '';
        };
    }
}

export class InventoryQuerySearchTableTSAPI extends BaseQuerySearchTableTSAPI {
    public projectIds:Ref<readonly any[]> = computed(() => (this.state.items as any[]).map(v => v.project_id))
}
