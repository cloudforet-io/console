/* eslint-disable camelcase */
import { BaseQueryAPI, getBaseQueryApiState } from '@/lib/fluent-api/toolset';
import { isNotEmpty } from '@/lib/util';
import {
    Aggregate,
    AggregateState,
    Group,
    GroupFieldsItem,
    GroupKeyItem,
    JoinStateItem,
    STAT_OPERATORS,
    StatQuery,
    StatQueryState,
    UnwindItem,
} from '@/lib/fluent-api/statistics/type';
import { ApiType } from '@/lib/fluent-api/type';
import _ from 'lodash';


export const getInitStatQueryState = <parameter=undefined>(): StatQueryState<parameter> => ({
    aggregate: {
        unwind: [],
        group: {
            keys: [],
            fields: [],
        },
        count: undefined,
    },
    distinct: undefined,
    sort: undefined,
    limit: undefined,
    ...getBaseQueryApiState<parameter>(),
} as unknown as StatQueryState<parameter>);

export const getInitJoinState = (): JoinStateItem => ({
    keys: [],
    type: '',
    resource_type: '',
    query: getInitStatQueryState(),
});


export abstract class StatQueryAPI<parameter, resp> extends BaseQueryAPI<parameter, resp> {
    protected apiState: StatQueryState<parameter> ;

    constructor(
        api: ApiType,
        baseUrl: string,
        initState: any = {},
        transformer: null|((any) => any) = null,
    ) {
        super(api, baseUrl, undefined, transformer);
        this.apiState = {
            ...getInitStatQueryState<parameter>(),
            ...initState,
        };
    }

    protected query = (): StatQuery => this.getStatisticsQuery<StatQuery>({} as StatQuery);

    // eslint-disable-next-line class-methods-use-this
    protected getAggregate(state: StatQueryState<any>): Aggregate {
        const aggregate: Aggregate = {} as Aggregate;
        if (state.aggregate.unwind && state.aggregate.unwind.length > 0) aggregate.unwind = state.aggregate.unwind;
        if (state.aggregate.group?.keys.length > 0 || state.aggregate.group?.fields.length > 0) aggregate.group = state.aggregate.group;
        if (state.aggregate.unwind && state.aggregate.unwind.length > 0) aggregate.unwind = state.aggregate.unwind;
        if (state.aggregate.count) aggregate.count = state.aggregate.count;
        return aggregate;
    }

    protected getStatisticsQuery<Q extends StatQuery>(query: Q, state?: StatQueryState<any>): Q {
        const apiState = state || this.apiState;
        if (isNotEmpty(apiState.sort)) query.sort = apiState.sort;
        if (apiState.limit !== undefined) query.page = { limit: apiState.limit };
        if (apiState.distinct === undefined) query.aggregate = this.getAggregate(apiState);
        else query.distinct = apiState.distinct;
        return this.getBaseQuery<Q>(query, state) as Q;
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    setAggregate(aggregate: AggregateState): this {
        const api = this.clone();
        api.apiState.aggregate = aggregate;
        return api;
    }

    setGroup(group: Group): this {
        const api = this.clone();
        api.apiState.aggregate.group = group;
        return api;
    }

    setGroupKeys(...args: GroupKeyItem[]): this {
        const api = this.clone();
        api.apiState.aggregate.group.keys = args;
        return api;
    }

    addGroupKey(key: string, name: string): this {
        const api = this.clone();
        api.apiState.aggregate.group.keys.push({ key, name });
        return api;
    }

    setGroupFields(...args: GroupFieldsItem[]): this {
        const api = this.clone();
        api.apiState.aggregate.group.fields = args;
        return api;
    }

    addGroupField(name: string, operator: STAT_OPERATORS, key?: string): this {
        const api = this.clone();
        const item: GroupFieldsItem = { name, operator };
        if (key) item.key = key;
        api.apiState.aggregate.group.fields.push(item);
        return api;
    }

    setUnwind(...args: UnwindItem[]): this {
        const api = this.clone();
        api.apiState.aggregate.unwind = args;
        return api;
    }

    addUnwind(unwind: UnwindItem): this {
        const api = this.clone();
        if (api.apiState.aggregate.unwind) api.apiState.aggregate.unwind.push(unwind);
        return api;
    }

    setCount(name: string): this {
        const api = this.clone();
        api.apiState.aggregate.count = { name };
        return api;
    }

    setSort(name: string, desc = true): this {
        const api = this.clone();
        api.apiState.sort = { name, desc };
        return api;
    }

    setLimit(limit: number): this {
        const api = this.clone();
        api.apiState.limit = limit;
        return api;
    }

    setDistinct(distinct: string): this {
        const api = this.clone();
        api.apiState.distinct = distinct;
        return api;
    }
}

export abstract class StatAction<parameter, resp> extends StatQueryAPI<parameter, resp> {
    protected path = 'stat';
}
