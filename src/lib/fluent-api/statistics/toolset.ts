/* eslint-disable camelcase */
import { BaseQueryAPI } from '@/lib/fluent-api/toolset';
import { isNotEmpty } from '@/lib/util';
import {
    Aggregate, Group, GroupFieldsItem, GroupKeyItem, JoinStateItem, STAT_OPERATORS, StatQuery, StatQueryState, UnwindItem,
} from '@/lib/fluent-api/statistics/type';
import { ApiType } from '@/lib/fluent-api/type';
import _ from 'lodash';

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
            aggregate: {
                group: {
                    keys: [],
                    fields: [],
                },
            },
            filter: [],
            filterOr: [],
            fixFilter: [],
            extraParameter: {},
            ...initState,
        };
    }

    protected query = (): StatQuery => this.getStatisticsQuery<StatQuery>({} as StatQuery);

    protected getStatisticsQuery<Q extends StatQuery>(query: Q, state?: StatQueryState<any>): Q {
        const apiState = state || this.apiState;
        query.aggregate = apiState.aggregate;
        if (isNotEmpty(apiState.sort)) query.sort = apiState.sort;
        if (isNotEmpty(apiState.limit)) query.limit = apiState.limit;
        return this.getBaseQuery<Q>(query, state) as Q;
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    setAggregate(aggregate: Aggregate): this {
        const api = this.clone();
        this.apiState.aggregate = aggregate;
        return api;
    }

    setGroup(group: Group): this {
        const api = this.clone();
        this.apiState.aggregate.group = group;
        return api;
    }

    setGroupKeys(...args: GroupKeyItem[]): this {
        const api = this.clone();
        this.apiState.aggregate.group.keys = args;
        return api;
    }

    addGroupKey(key: string, name: string): this {
        const api = this.clone();
        this.apiState.aggregate.group.keys.push({ key, name });
        return api;
    }

    setGroupFields(...args: GroupFieldsItem[]): this {
        const api = this.clone();
        this.apiState.aggregate.group.fields = args;
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
        this.apiState.aggregate.unwind = args;
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
}

export const getInitJoinState = (): JoinStateItem => ({
    keys: [],
    type: '',
    resource_type: '',
    query: {
        aggregate: {
            group: {
                keys: [],
                fields: [],
            },
        },
        filter: [],
        filterOr: [],
        fixFilter: [],
        extraParameter: undefined,
    },
});

export abstract class StatAction<parameter, resp> extends StatQueryAPI<parameter, resp> {
    protected path = 'stat';
}
