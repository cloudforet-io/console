/* eslint-disable camelcase */
import { AxiosResponse } from 'axios';
import _ from 'lodash';
import { api } from '@/lib/api/axios';
import {
    ApiMethods,
    FilterType,
    Query,
    FilterItem,
    ShortFilterType, GetActionState, RawParameterActionState, QueryApiState,
} from '@/lib/fluent-api/type';


export abstract class ActionAPI<parameter=any, resp=any> {
    protected abstract path: string;

    protected method: ApiMethods = 'post';

    protected baseUrl: string;

    protected apiState: any;

    protected transformer: ((any) => any|Promise<any>)|null;

    public abstract getParameter: () => parameter

    async execute(): Promise<AxiosResponse<resp>> {
        let resp: any;
        if (this.method === 'get') {
            resp = await api.instance[this.method](this.url);
        } else {
            // @ts-ignore
            resp = await api.instance[this.method](this.url, this.getParameter());
        }
        if (this.transformer) {
            resp = await this.transformer(resp);
        }
        return resp;
    }

    protected constructor(
        baseUrl: string,
        apiState?: any,
        transformer: ((any) => any|Promise<any>)|null = null,
    ) {
        this.baseUrl = baseUrl;
        this.apiState = apiState || {};
        this.transformer = transformer;
    }

    setTransformer(func: (any) => any|Promise<any>) {
        this.transformer = func;
        return this.clone();
    }


    get url() {
        return this.baseUrl + this.path;
    }

    debug(...states: string[]) {
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
        return new this.constructor(this.baseUrl, this.apiState, this.transformer);
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

export abstract class QueryAPI<parameter, resp> extends ActionAPI<parameter, resp> {
    protected apiState: QueryApiState<parameter> ;

    constructor(baseUrl: string, initState: QueryApiState<parameter> = {} as unknown as QueryApiState<parameter>, transformer: null|((any) => any) = null) {
        super(baseUrl, undefined, transformer);
        this.apiState = {
            filter: [] as unknown as FilterItem[],
            fixFilter: [] as unknown as FilterItem[],
            only: [] as unknown as string[],
            thisPage: 1,
            pageSize: 15,
            sortBy: '',
            sortDesc: true,
            keyword: '',
            extraParameter: {},
            count_only: false,
            ...initState,
        };
    }

    protected query = () => {
        const query: Query = {};
        if (this.apiState.thisPage !== 0) {
            query.page = {
                start: ((this.apiState.thisPage - 1) * this.apiState.pageSize) + 1,
                limit: this.apiState.pageSize,
            };
        }
        if (this.apiState.sortBy) {
            query.sort = {
                key: this.apiState.sortBy,
                desc: this.apiState.sortDesc,
            };
        }
        if (this.apiState.only.length > 0) {
            query.only = this.apiState.only;
        }
        if (this.apiState.count_only) {
            query.count_only = this.apiState.count_only;
        }
        if (this.apiState.keyword) {
            query.keyword = this.apiState.keyword;
        }
        if (this.apiState.filter.length > 0 || this.apiState.fixFilter.length > 0) {
            const filter: FilterType[] = [];
            // eslint-disable-next-line camelcase
            const mergeOpQuery: {
                    [propName: string]: ShortFilterType;
                } = {};
            const rawFilters = [...this.apiState.fixFilter, ...this.apiState.filter];
            rawFilters.forEach((q: FilterItem) => {
                const op = operatorMap[q.operator];
                const vals = typeof q.value === 'string' ? [q.value] : q.value;

                if (mergeOperatorSet.has(op)) {
                    const prefix = `${q.key}:${op}`;

                    // if operation is ['contain_in', 'not_contain_in', 'in', 'not_in'] then merge filter
                    if (mergeOpQuery[prefix]) {
                        mergeOpQuery[prefix].v = _.merge(mergeOpQuery[prefix].v, vals);
                        // ((mergeOpQuery[prefix] as ShortFilterType).v as string[]).push(q.value);
                    } else {
                        mergeOpQuery[prefix] = {
                            k: q.key,
                            v: vals,
                            o: op,
                        };
                    }
                } else {
                    filter.push({
                        k: q.key,
                        v: vals,
                        o: op,
                    });
                }
            });
            // eslint-disable-next-line camelcase
            if (filter.length > 0 || !_.isEmpty(mergeOpQuery)) {
                query.filter = [...filter, ...Object.values(mergeOpQuery)];
            }
        }
        return query as Query;
    };


    getParameter = () => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    setOnly(...args: string[]) {
        this.apiState.only = args;
        return this.clone();
    }

    setCountOnly(value = true) {
        this.apiState.count_only = value;
        return this.clone();
    }

    setFilter(...args: FilterItem[]) {
        this.apiState.filter = args;
        return this.clone();
    }

    setFixFilter(...args: FilterItem[]) {
        this.apiState.fixFilter = args;
        return this.clone();
    }

    setThisPage(thisPage: number) {
        this.apiState.thisPage = thisPage;
        return this.clone();
    }

    setPageSize(pageSize: number) {
        this.apiState.pageSize = pageSize;
        return this.clone();
    }

    setSortBy(sortBy: string) {
        this.apiState.sortBy = sortBy;
        return this.clone();
    }

    setSortDesc(sortDesc: boolean) {
        this.apiState.sortDesc = sortDesc;
        return this.clone();
    }

    setKeyword(keyword: string) {
        this.apiState.keyword = keyword;
        return this.clone();
    }
}

interface SingleItemActionInterface{
    setId: (id: string) => any;
}
export abstract class RawParameterAction<parameter, resp> extends ActionAPI<parameter, resp> {
    getParameter = () => this.apiState.parameter;

    protected apiState: RawParameterActionState<parameter>;

    constructor(
        baseUrl: string,
        initState: RawParameterActionState<parameter> = { parameter: {} as parameter },
        transformer: ((any) => any|Promise<any>)|null = null,
    ) {
        super(baseUrl, initState, transformer);
        this.apiState = {
            ...initState,
        };
    }
}

export abstract class SetParameterAction<parameter, resp> extends RawParameterAction<parameter, resp> {
    setParameter(parameter: parameter) {
        this.apiState.parameter = parameter;
        return this.clone();
    }
}

export abstract class CreateAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    protected path = 'create'
}

export abstract class UpdateAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    protected path = 'update'
}

export abstract class SingleItemAction<parameter, resp> extends RawParameterAction<parameter, resp> implements SingleItemActionInterface {
    protected abstract idField: string;


    setId(id: string) {
        this.apiState.parameter[this.idField] = id;
        return this.clone();
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

    constructor(baseUrl: string, initState: TreeActionState<parameter> = {} as unknown as TreeActionState<parameter>, transformer: null|((any) => any) = null) {
        super(baseUrl, undefined, transformer);
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

    setRootItemType(name = 'ROOT') {
        this.apiState.rootItemType = name;
        return this.clone();
    }

    setRoot() {
        this.apiState.item_type = this.apiState.rootItemType;
        this.apiState.item_id = '';
        return this.clone();
    }

    setItemType(val: string) {
        this.apiState.item_type = val;
        return this.clone();
    }

    setItemId(val: string) {
        this.apiState.item_id = val;
        return this.clone();
    }


    setSortBy(sortBy: string) {
        this.apiState.sortBy = sortBy;
        return this.clone();
    }

    setSortDesc(sortDesc: boolean) {
        this.apiState.sortDesc = sortDesc;
        return this.clone();
    }

    protected setExcludeType(val: string) {
        this.apiState.exclude_type = val;
        return this.clone();
    }

    getParameter = () => {
        const params: any = {};

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
export abstract class GetAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'get';

    protected apiState: GetActionState<parameter>;

    constructor(
        baseUrl: string,
        apiState: GetActionState<parameter> = {
            parameter: {} as parameter,
            only: [] as string[],
        },
        transformer: ((any) => any|Promise<any>)|null = null,
    ) {
        super(baseUrl, undefined, transformer);
        this.apiState = apiState;
    }

    getParameter = () => {
        const query = { only: this.apiState.only };
        return {
            ...this.apiState.parameter,
            query,
        };
    };

    setOnly(...args: string[]) {
        this.apiState.only = args;
        return this.clone();
    }

    getIdField() {
        return this.idField;
    }
}

export abstract class SingleDeleteAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'delete';
}

export abstract class SingleEnableAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'enable';
}

export abstract class SingleDisableAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'disable';
}


// use when one source sub items add or delete ex) add group credential
export abstract class SubMultiItemAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected abstract subIdsField: string;

    setSubIds(subIds: string[]) {
        this.apiState.parameter[this.subIdsField] = subIds;
        return this.clone();
    }
}

export abstract class SubMultiItemAddAction<parameter, resp> extends SubMultiItemAction<parameter, resp> {
    protected path = 'add'
}

export abstract class SubMultiItemRemoveAction<parameter, resp> extends SubMultiItemAction<parameter, resp> {
    protected path = 'remove'
}


export abstract class MultiItemAction<parameter, resp> extends RawParameterAction<parameter, resp> {
    protected abstract idsField: string;

    setIds(ids: string[]) {
        this.apiState.parameter[this.idsField] = ids;
        return this.clone();
    }
}
export abstract class MultiItemQueryAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected abstract idsField: string;

    setIds(ids: string[]) {
        this.apiState.extraParameter[this.idsField] = ids;
        return this.clone();
    }
}

export abstract class MemberListAction<parameter, resp> extends MultiItemQueryAction<parameter, resp> {
    path = 'member/list'
}

export abstract class MultiEnableAction<parameter, resp> extends MultiItemAction<parameter, resp> {
    protected path = 'enable';
}
export abstract class MultiDisableAction<parameter, resp> extends MultiItemAction<parameter, resp> {
    protected path = 'disable';
}

export abstract class MultiDeleteAction<parameter, resp> extends MultiItemAction<parameter, resp> {
    protected path = 'delete';
}


export abstract class ListAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected path = 'list';
}

export abstract class GetDataAction<parameter, resp> extends QueryAPI<parameter, resp> implements SingleItemActionInterface {
    protected path = 'get-data';

    protected abstract idField: string;

    setId(id: string) {
        this.apiState.extraParameter[this.idField] = id;
        return this.clone();
    }

    setKeyPath(keyPath: string) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.apiState.extraParameter.key_path = keyPath;
        return this.clone();
    }
}

export abstract class CollectAction<parameter, resp> extends SetParameterAction<parameter, resp> {
    protected path = 'collect';
}

export type ResourceActions<actions extends string> = { [key in actions]: (...args: any[]) => ActionAPI<any, any> };

export abstract class Resource {
    protected abstract name: string;

    get baseUrl() {
        return `/${this.service}/${this.name}/`;
    }

    constructor(protected service: string) {
    }
}

export type ServiceResources<resources extends string> = { [key in resources]?: (service: string) => Resource};

export abstract class Service {
    protected abstract name: string;
}

export interface BaseResources<parameter, resp> extends Resource, ResourceActions<'update'|'get'>{}

export interface DictResource<parameter, resp> extends Resource, ResourceActions<'update'|'get'> {
    update: () => UpdateAction<parameter, resp>;
    get: () => GetAction<parameter, resp>;
}
