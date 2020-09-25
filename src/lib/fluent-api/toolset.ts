/* eslint-disable camelcase, @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import _ from 'lodash';
import {
    ApiMethods,
    FilterItem,
    FilterType,
    GetActionState,
    Query,
    ShortFilterType,
    RawParameterActionState,
    QueryApiState,
    BaseQueryState, BaseQuery, ApiType, ActionAPIInterface, TreeParameter, Page,
} from '@/lib/fluent-api/type';


export abstract class ActionAPI<parameter = any, resp = any> implements ActionAPIInterface<parameter, resp> {
    protected abstract path: string;

    protected method: ApiMethods = 'post';

    protected baseUrl: string;

    protected apiState: any;

    protected transformer: ((resp) => any | Promise<any>) | null;

    public abstract getParameter: () => parameter

    isMutationApi = false

    async execute(): Promise<AxiosResponse<resp>> {
        let resp: AxiosResponse<resp> | any;
        if (this.method === 'get') {
            resp = await this.api.instance[this.method](this.url);
        } else {
            resp = await this.api.instance[this.method as string](this.url, this.getParameter());
        }
        if (this.transformer) {
            resp = await this.transformer(resp);
        }
        return resp;
    }

    protected constructor(
        public api: ApiType,
        baseUrl: string,
        apiState?: any,
        transformer: ((any) => any | Promise<any>) | null = null,
    ) {
        this.baseUrl = baseUrl;
        this.apiState = apiState || {} as any;
        this.transformer = transformer;
    }

    setTransformer<returnType = any>(func: (resp: AxiosResponse<resp>) => returnType | Promise<returnType>): this {
        const api = this.clone();
        api.transformer = func;
        return api;
    }


    get url(): string {
        return this.baseUrl + this.path;
    }

    debug(...states: string[]): void {
        console.debug('*********************');
        console.debug('url : ', this.url);
        console.debug('method : ', this.method);
        console.debug('state : ', this.apiState);
        if (states) {
            states.forEach(((key) => {
                console.debug(`state.${key} : ${JSON.stringify(this.apiState[key])}`);
            }));
        }
        console.debug('*********************');
    }

    clone(): this {
        // @ts-ignore
        return new this.constructor(this.api, this.baseUrl, this.apiState, this.transformer);
    }
}

export interface ConfigActionState<T=any> {
    name: string;
    parameter: T;
}

export abstract class BaseConfigActionAPI<parameter, resp> extends ActionAPI<parameter, resp> {
    getParameter = (): any => ({ name: this.name, data: { ...this.apiState.parameter } });

    protected apiState: ConfigActionState<parameter>;

    protected _userId = '';


    constructor(
        api: ApiType,
        baseUrl: string,
        initState: ConfigActionState<parameter> = { name: '', parameter: {} as parameter },
        transformer: ((any) => any | Promise<any>) | null = null,
    ) {
        super(api, baseUrl, initState, transformer);
        this.apiState = {
            ...initState,
        };
    }

    set userId(id: string) {
        this._userId = id;
    }

    get userId() {
        return this._userId || JSON.parse(localStorage.getItem('user/userId') as string).data;
    }

    get name() {
        return `console/${this.userId}${this.baseUrl}`;
    }

    get url() {
        return `config/config-map/${this.path}`;
    }
}


export class GetConfigAction<parameter, resp> extends BaseConfigActionAPI<parameter, resp> {
    protected path = 'get';
}


export const OPERATOR_MAP = Object.freeze({
    '': 'contain_in', // merge operator
    '!': 'not_contain', // merge operator
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    '=': 'in', // merge operator
    '!=': 'not_in', // merge operator
    $: 'regex',
    td_lt: 'timediff_lt',
    td_gt: 'timediff_gt',
    td_lte: 'timediff_lte',
    td_gte: 'timediff_gte',
    in: 'in', // merge operator
    not_in: 'not_in', // merge operator
    contain_in: 'contain_in', // merge operator
    not_contain: 'not_contain', // merge operator
    eq: 'in', // merge operator
    not_eq: 'not_in', // merge operator
    sum: 'sum',
});

const MERGE_OPERATOR_SET = new Set(['contain_in', 'not_contain_in', 'in', 'not_in']);

type MergeQueryType = { [k: string]: ShortFilterType };

const mergeQuery = (targetQuery: MergeQueryType, q: FilterItem, op: string): MergeQueryType => {
    const prefix = `${q.key}:${op}`;
    const vals = Array.isArray(q.value) ? q.value : [q.value];
    if (targetQuery[prefix]) {
        targetQuery[prefix].v = [...targetQuery[prefix].v as string[], ...vals];
    } else {
        targetQuery[prefix] = {
            k: q.key,
            v: vals,
            o: op,
        };
    }
    return targetQuery;
};

export const filterItemToQuery = (filters: FilterItem[] = [], fixedFilters: FilterItem[] = []): FilterType[] | undefined => {
    const rawFilters: FilterItem[] = [...fixedFilters, ...filters];
    if (rawFilters.length === 0) return undefined;

    const newFilters: FilterType[] = [];
    let mergeOpQuery: MergeQueryType = {};

    rawFilters.forEach((q: FilterItem) => {
        const op = OPERATOR_MAP[q.operator];

        if (MERGE_OPERATOR_SET.has(op)) {
            mergeOpQuery = mergeQuery(mergeOpQuery, q, op);
        } else {
            newFilters.push({ k: q.key, v: q.value, o: op });
        }
    });

    if (newFilters.length > 0 || !_.isEmpty(mergeOpQuery)) {
        return [...newFilters, ...Object.values(mergeOpQuery)];
    }
    return undefined;
};

function getQueryWithApiState<T>(keys: string[], apiState: any): T {
    const res: T = {} as T;
    keys.forEach((k) => {
        if (apiState[k]) res[k] = apiState[k];
    });
    return res;
}

export const getBaseQueryApiState = <parameter>(): BaseQueryState<parameter> => ({
    filter: [],
    filterOr: [],
    fixFilter: [],
    fixFilterOr: [],
    extraParameter: {} as parameter,
});


export abstract class BaseQueryAPI<parameter, resp> extends ActionAPI<parameter, resp> {
    protected apiState: BaseQueryState<parameter>;

    constructor(
        api: ApiType,
        baseUrl: string,
        initState: BaseQueryState<parameter> = {} as BaseQueryState<parameter>,
        transformer: null | ((any) => any) = null,
    ) {
        super(api, baseUrl, undefined, transformer);
        this.apiState = {
            ...getBaseQueryApiState<parameter>(),
            ...initState,
        };
    }

    protected abstract query = (): BaseQuery => this.getBaseQuery<BaseQuery>({} as BaseQuery);

    protected getBaseQuery<Q extends BaseQuery>(query: Q, state?: BaseQueryState<any>): Q {
        const apiState = state || this.apiState;
        if (Array.isArray(apiState.filter) || Array.isArray(apiState.fixFilter)) {
            const newFilter: FilterType[] | undefined = filterItemToQuery(apiState.filter, apiState.fixFilter);
            if (newFilter) query.filter = newFilter;
        }
        if (Array.isArray(apiState.filterOr) || Array.isArray(apiState.fixFilterOr)) {
            const newFilterOr: FilterType[] | undefined = filterItemToQuery(apiState.filterOr, apiState.fixFilterOr);
            if (newFilterOr) query.filter_or = newFilterOr;
        }
        return query as Q;
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    setFilter(...args: FilterItem[]): this {
        const api = this.clone();
        api.apiState.filter = args;
        return api;
    }

    setFixFilter(...args: FilterItem[]): this {
        const api = this.clone();
        api.apiState.fixFilter = args;
        return api;
    }

    setFilterOr(...args: FilterItem[]): this {
        this.apiState.filterOr = args;
        return this.clone();
    }

    setFixFilterOr(...args: FilterItem[]): this {
        this.apiState.fixFilterOr = args;
        return this.clone();
    }
}


export abstract class QueryAPI<parameter, resp> extends BaseQueryAPI<parameter, resp> {
    protected apiState: QueryApiState<parameter>;

    constructor(
        api: ApiType,
        baseUrl: string,
        initState: QueryApiState<parameter> = {} as unknown as QueryApiState<parameter>,
        transformer: null | ((any) => any) = null,
    ) {
        super(api, baseUrl, undefined, transformer);
        this.apiState = {
            ...getBaseQueryApiState<parameter>(),
            only: [] as string[],
            fixOnly: [] as string[],
            thisPage: 0,
            pageSize: 0,
            sortBy: '',
            sortDesc: true,
            keyword: '',
            count_only: false,
            ...initState,
        };
    }

    protected query = (): Query => {
        const query: Query = {};

        if (this.apiState.thisPage !== 0 || this.apiState.pageSize !== 0) {
            const page: Page = {} as Page;
            if (this.apiState.thisPage !== 0) {
                page.start = ((this.apiState.thisPage - 1) * this.apiState.pageSize) + 1;
            }
            if (this.apiState.pageSize !== 0) {
                page.limit = this.apiState.pageSize;
            }
            query.page = page;
        }
        if (this.apiState.sortBy) {
            query.sort = {
                key: this.apiState.sortBy,
                desc: this.apiState.sortDesc,
            };
        }
        if (this.apiState.only.length > 0 || this.apiState.fixOnly.length > 0) {
            query.only = [...this.apiState.fixOnly, ...this.apiState.only];
        }
        if (this.apiState.count_only) {
            query.count_only = this.apiState.count_only;
        }
        if (this.apiState.keyword) {
            query.keyword = this.apiState.keyword;
        }

        return { ...query, ...this.getBaseQuery<Query>(query) } as Query;
    };

    setOnly(...args: string[]): this {
        const api = this.clone();
        api.apiState.only = args;
        return api;
    }

    setFixOnly(...args: string[]): this {
        const api = this.clone();
        api.apiState.fixOnly = args;
        return api;
    }

    setCountOnly(value = true): this {
        const api = this.clone();
        api.apiState.count_only = value;
        return api;
    }

    setThisPage(thisPage: number): this {
        const api = this.clone();
        api.apiState.thisPage = thisPage;
        return api;
    }

    setPageSize(pageSize: number): this {
        const api = this.clone();
        api.apiState.pageSize = pageSize;
        return api;
    }

    setSortBy(sortBy: string): this {
        const api = this.clone();
        api.apiState.sortBy = sortBy;
        return api;
    }

    setSortDesc(sortDesc: boolean): this {
        const api = this.clone();
        api.apiState.sortDesc = sortDesc;
        return api;
    }

    setKeyword(keyword: string): this {
        const api = this.clone();
        api.apiState.keyword = keyword;
        return api;
    }
}

interface SingleItemActionInterface {
    setId: (id: string) => any;
}

export abstract class RawParameterAction<parameter, resp> extends ActionAPI<parameter, resp> {
    getParameter = (): parameter => ({ ...this.apiState.parameter });

    protected apiState: RawParameterActionState<parameter>;

    constructor(
        api: ApiType,
        baseUrl: string,
        initState: RawParameterActionState<parameter> = { parameter: {} as parameter },
        transformer: ((any) => any | Promise<any>) | null = null,
    ) {
        super(api, baseUrl, initState, transformer);
        this.apiState = {
            ...initState,
        };
    }
}

export abstract class SetParameterAction<parameter, resp> extends RawParameterAction<parameter, resp> {
    setParameter(parameter: parameter): this {
        const api = this.clone();
        api.apiState.parameter = parameter;
        return api;
    }
}

export abstract class AddAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'add'
}

export abstract class CreateAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'create'
}

export abstract class RegisterAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'register'
}

export abstract class UpdateAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'update'
}

export abstract class SingleItemAction<parameter, resp> extends RawParameterAction<parameter, resp> implements SingleItemActionInterface {
    public abstract idField: string;


    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter[this.idField] = id;
        return api;
    }
}


interface TreeActionState<parameter = any> {
    rootItemType: string;
    item_id: string;
    item_type: string;
    sortBy: string;
    sortDesc: boolean;
    extraParameter: parameter;
    exclude_type: string;
}

export abstract class TreeAction<parameter, resp> extends ActionAPI<parameter, resp> {
    protected path = 'tree';

    protected apiState: TreeActionState<parameter>;

    constructor(api: ApiType, baseUrl: string, initState: TreeActionState<parameter> = {} as unknown as TreeActionState<parameter>, transformer: null | ((any) => any) = null) {
        super(api, baseUrl, undefined, transformer);
        this.apiState = {
            rootItemType: 'ROOT',
            item_id: '',
            item_type: '',
            sortBy: '',
            sortDesc: true,
            exclude_type: '',
            extraParameter: {},
            ...initState,
        };
    }

    setRootItemType(name = 'ROOT'): this {
        this.apiState.rootItemType = name;
        return this.clone();
    }

    setRoot(): this {
        this.apiState.item_type = this.apiState.rootItemType;
        this.apiState.item_id = '';
        return this.clone();
    }

    setItemType(val: string): this {
        this.apiState.item_type = val;
        return this.clone();
    }

    setItemId(val: string): this {
        this.apiState.item_id = val;
        return this.clone();
    }


    setSortBy(sortBy: string): this {
        this.apiState.sortBy = sortBy;
        return this.clone();
    }

    setSortDesc(sortDesc: boolean): this {
        this.apiState.sortDesc = sortDesc;
        return this.clone();
    }

    protected setExcludeType(val: string): this {
        this.apiState.exclude_type = val;
        return this.clone();
    }

    getParameter = (): parameter & any => {
        const params: TreeParameter = {};

        if (this.apiState.item_type) {
            params.item_type = this.apiState.item_type;
            if (this.apiState.item_id) {
                params.item_id = this.apiState.item_id;
            }
        }

        if (this.apiState.sortBy) {
            params.sort = {
                key: this.apiState.sortBy,
                desc: this.apiState.sortDesc,
            };
        }

        if (this.apiState.exclude_type) {
            params.exclude_type = this.apiState.exclude_type;
        }

        return {
            ...params,
            ...this.apiState.extraParameter,
        };
    };
}

export abstract class TreeSearchAction<parameter, resp> extends TreeAction<parameter, resp> {
    protected path = 'tree/search';
}

export abstract class GetAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'get';

    protected apiState: GetActionState<parameter>;

    constructor(
        api: ApiType,
        baseUrl: string,
        apiState: GetActionState<parameter> = {
            parameter: {} as parameter,
            only: [] as string[],
            fixOnly: [] as string[],
        },
        transformer: ((any) => any | Promise<any>) | null = null,
    ) {
        super(api, baseUrl, undefined, transformer);
        this.apiState = apiState;
    }

    getParameter = (): { only?: string[] } & parameter => {
        const parms: any = { ...this.apiState.parameter };
        if (this.apiState.only.length || this.apiState.fixOnly.length) {
            parms.only = [...this.apiState.fixOnly, ...this.apiState.only];
        }
        return parms;
    };

    setOnly(...args: string[]): this {
        this.apiState.only = args;
        return this.clone();
    }

    setFixOnly(...args: string[]): this {
        const api = this.clone();
        api.apiState.fixOnly = args;
        return api;
    }

    getIdField(): string {
        return this.idField;
    }
}

export abstract class SingleDeleteAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'delete';
}

export abstract class SingleDeregisterAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'deregister';
}

export abstract class SingleEnableAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'enable';
}

export abstract class SingleDisableAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'disable';
}


// use when one source sub items add or delete ex) add group credential
export abstract class SubMultiItemAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected abstract subIdsField: string;

    setSubIds(subIds: any[]): this {
        this.apiState.parameter[this.subIdsField] = subIds;
        return this.clone();
    }
}

export abstract class SubMultiItemAddAction<parameter, resp> extends SubMultiItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'add'
}


export abstract class MultiItemAction<parameter, resp> extends RawParameterAction<parameter, resp> {
    protected abstract idsField: string;

    setIds(ids: string[]): this {
        this.apiState.parameter[this.idsField] = ids;
        return this.clone();
    }
}

export abstract class MultiItemQueryAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected abstract idsField: string;

    setIds(ids: string[]): this {
        this.apiState.extraParameter[this.idsField] = ids;
        return this.clone();
    }
}

export abstract class SingleItemQueryAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected abstract idField: string;

    setId(id?: string): this {
        const api = this.clone();
        if (id) api.apiState.extraParameter[this.idField] = id;
        else delete api.apiState.extraParameter[this.idField];
        return api;
    }
}

export abstract class MemberListAction<parameter, resp> extends MultiItemQueryAction<parameter, resp> {
    path = 'member/list'
}

export abstract class SingleItemMemberListAction<parameter, resp> extends SingleItemQueryAction<parameter, resp> {
    path = 'member/list'
}

export abstract class MultiEnableAction<parameter, resp> extends MultiItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'enable';
}

export abstract class MultiDisableAction<parameter, resp> extends MultiItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'disable';
}

export abstract class MultiDeleteAction<parameter, resp> extends MultiItemAction<parameter, resp> {
    isMutationApi = true;

    protected path = 'delete';
}


export abstract class ListAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected path = 'list';
}

export abstract class GetDataAction<parameter, resp> extends QueryAPI<parameter, resp> implements SingleItemActionInterface {
    protected path = 'get-data';

    protected abstract idField: string;

    setId(id: string): this {
        this.apiState.extraParameter[this.idField] = id;
        return this.clone();
    }

    setKeyPath(keyPath: string): this {
        // @ts-ignore
        this.apiState.extraParameter.key_path = keyPath;
        return this.clone();
    }
}

export abstract class CollectAction<parameter, resp> extends RawParameterAction<parameter, resp> {
    protected path = 'collect';
}

export type ResourceActions<actions extends string, parameter=any, resp=any> = { [key in actions]: (...args: any[]) => ActionAPI<parameter, resp> };

export abstract class Resource {
    protected abstract name: string;

    get baseUrl(): string {
        return `/${this.service}/${this.name}/`;
    }

    constructor(public api: ApiType, protected service: string) {
    }
}

export type ServiceResources<resources extends string> = { [key in resources]?: (api: ApiType, service: string) => Resource };

export abstract class Service {
    protected abstract name: string;

    constructor(public api: ApiType) {
    }
}

export interface BaseResources<parameter, resp> extends Resource, ResourceActions<'update' | 'get'> {
}

export interface DictResource<parameter, resp> extends Resource, ResourceActions<'update' | 'get'> {
    update: () => UpdateAction<parameter, resp>;
    get: () => GetAction<parameter, resp>;
}
