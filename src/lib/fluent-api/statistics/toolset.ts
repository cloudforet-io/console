/* eslint-disable camelcase */
import { BaseQueryAPI } from '@/lib/fluent-api/toolset';
import { isNotEmpty } from '@/lib/util';
import {
    Aggregate, Group, GroupFieldsItem, GroupKeyItem, GroupKeys, STAT_OPERATORS, StatQueryState, UnwindItem,
} from '@/lib/fluent-api/statistics/type';
import { ApiType } from '@/lib/fluent-api/type';


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
                },
            },
            filter: [],
            filterOr: [],
            fixFilter: [],
            extraParameter: {},
            ...initState,
        };
    }

    protected query = (): StatQueryState<parameter> => this.getStatisticsQuery<StatQueryState<parameter>>({} as StatQueryState<parameter>);

    protected getStatisticsQuery<Q extends StatQueryState<parameter>>(query: Q): Q {
        query.aggregate = this.apiState.aggregate;
        if (isNotEmpty(this.apiState.sort)) query.sort = this.apiState.sort;
        if (isNotEmpty(this.apiState.limit)) query.limit = this.apiState.limit;
        return this.getBaseQuery<StatQueryState<parameter>>(query) as Q;
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    setAggregate(aggregate: Aggregate): this {
        const api = this.clone();
        api.apiState.aggregate = aggregate;
        return api;
    }

    setGroup(group: Group): this {
        const api = this.clone();
        api.apiState.aggregate.group = group;
        return api;
    }

    setGroupKeys(...args: GroupKeys): this {
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
        if (!api.apiState.aggregate.group.fields) api.apiState.aggregate.group.fields = [];
        if (key) item.key = key;
        api.apiState.aggregate.group.fields.push(item);
        return api;
    }

    setUnwind(...args: UnwindItem[]): this {
        const api = this.clone();
        api.apiState.aggregate.unwind = args;
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

export abstract class StatAction<parameter, resp> extends StatQueryAPI<parameter, resp> {
    protected path = 'stat';
}
