/* eslint-disable camelcase */
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { AxiosResponse } from 'axios';
import { computed, reactive } from '@vue/composition-api';
import _ from 'lodash';
import { api } from '@/lib/api/axios';
import {
    ApiMethods,
    BaseActionState,
    FilterType,
    Query,
    QueryActionState,
    FilterItem,
    ShortFilterType,
} from '@/lib/fluent-api/type';
import identity from '@/lib/mock/identity';

export abstract class ActionAPI<parameter, resp> {
    protected abstract path: string;

    protected method: ApiMethods = 'post';

    protected abstract apiState: UnwrapRef<BaseActionState<parameter>> | BaseActionState<parameter>;

    public async execute(): Promise<AxiosResponse<resp>> {
        let resp: any;
        if (this.method === 'get') {
            resp = await api.instance[this.method](this.url);
        } else {
            // @ts-ignore
            resp = await api.instance[this.method](this.url, this.apiState.parameter);
        }
        return resp;
    }

    protected constructor(protected baseUrl: string) {
    }


    get url() {
        return this.baseUrl + this.path;
    }

    debug() {
        console.debug('*********************');
        console.debug('url : ', this.url);
        console.debug('method : ', this.method);
        console.debug('state : ', this.apiState);
        console.debug('*********************');
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
    protected apiState: UnwrapRef<QueryActionState<parameter>> ;

    public constructor(baseUrl: string, initState:QueryActionState<parameter> = {} as unknown as QueryActionState<parameter>) {
        super(baseUrl);
        this.apiState = reactive(<QueryActionState<parameter>><unknown>{
            filter: [] as unknown as FilterItem[],
            only: [] as unknown as string[],
            thisPage: 1,
            pageSize: 15,
            sortBy: '',
            sortDesc: true,
            keyword: '',
            ...initState,
            query: computed(() => {
                const query:Query = {};
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
                if (this.apiState.keyword) {
                    query.keyword = this.apiState.keyword;
                }
                if (this.apiState.filter.length > 0) {
                    const filter: FilterType[] = [];
                    // eslint-disable-next-line camelcase
                    const mergeOpQuery: {
                        [propName: string]: FilterType;
                    } = {};
                    // @ts-ignore
                    this.apiState.filter.forEach((q:FilterItem) => {
                        const op = operatorMap[q.operator];
                        if (mergeOperatorSet.has(op)) {
                            const prefix = `${q.key}:${op}`;
                            // if operation is ['contain_in', 'not_contain_in', 'in', 'not_in'] then merge filter
                            if (mergeOpQuery[prefix]) {
                                ((mergeOpQuery[prefix] as ShortFilterType).v as string[]).push(q.value);
                            } else {
                                mergeOpQuery[prefix] = {
                                    k: q.key,
                                    v: [q.value],
                                    o: op,
                                };
                            }
                        } else {
                            filter.push({
                                k: q.key,
                                v: q.value,
                                o: op,
                            });
                        }
                    });
                    // eslint-disable-next-line camelcase
                    if (filter.length > 0 || !_.isEmpty(mergeOpQuery)) {
                        query.filter = [...filter, ...Object.values(mergeOpQuery)];
                    }
                }
                return <Query>query;
            }),
            extraParameter: {},
            parameter: computed(() => ({
                query: this.apiState.query,
                ...this.apiState.extraParameter,
            })),
        });
    }


    protected clone() :QueryAPI<parameter, resp> {
        return this.constructor(this.baseUrl, this.apiState);
    }

    addOnly(...args:string[]) {
        this.apiState.only.push(...args);
        return this.clone();
    }

    setOnly(...args:string[]) {
        this.apiState.only = args;
        return this.clone();
    }

    setOnlyTotalCount() {
        this.apiState.only = ['total_count'];
        return this.clone();
    }

    addFilter(...args:FilterItem[]) {
        // @ts-ignore
        this.apiState.filter.push(...args);
        return this.clone();
    }

    setFilter(...args:FilterItem[]) {
        // @ts-ignore
        this.apiState.filter = args;
        return this.clone();
    }

    setThisPage(thisPage:number) {
        this.apiState.thisPage = thisPage;
        return this.clone();
    }

    setPageSize(pageSize:number) {
        this.apiState.pageSize = pageSize;
        return this.clone();
    }

    setSortBy(sortBy:string) {
        this.apiState.sortBy = sortBy;
        return this.clone();
    }

    setSortDesc(sortDesc:boolean) {
        this.apiState.sortDesc = sortDesc;
        return this.clone();
    }

    setKeyword(keyword:string) {
        this.apiState.keyword = keyword;
        return this.clone();
    }
}
export abstract class SingleItemAction<parameter, resp> extends ActionAPI<parameter, resp> {
    protected abstract path;

    protected abstract idField: string;

    protected apiState = reactive({
        parameter: <parameter>{},
    });

    constructor(baseUrl, id: string) {
        super(baseUrl);
        this.setId(id);
    }

    protected setId(id: string) {
        console.debug(this.idField);
        this.apiState.parameter[this.idField] = id;
    }
}

export abstract class SingleDeleteAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'delete';
}

export abstract class GetAction<parameter, resp> extends SingleItemAction<parameter, resp> {
    protected path = 'get';
}


export abstract class ListAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected path = 'list';
}

export abstract class GetDataAction<parameter, resp> extends QueryAPI<parameter, resp> {
    protected path = 'get-data';

    protected abstract idField: string;

    public setId(id:string) {
        this.apiState.extraParameter[this.idField] = id;
        return this.clone();
    }

    public setKeyPath(keyPath:string) {
        this.apiState.extraParameter.key_path = keyPath;
        return this.clone();
    }
}

export type ResourceActions<actions extends string> = { [key in actions]: (...args: any[]) => ActionAPI<any, any> };

export abstract class Resource {
    protected abstract name: string;

    get baseUrl() {
        return `${this.service}/${this.name}/`;
    }

    public constructor(protected service: string) {
    }
}

export type ServiceResources<resources extends string> = { [key in resources]?: (service:string) => Resource};

export abstract class Service {
    protected abstract name: string;
}
