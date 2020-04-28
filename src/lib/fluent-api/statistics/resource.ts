/* eslint-disable camelcase */
import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import { StatAction, getInitJoinState } from '@/lib/fluent-api/statistics/toolset';
import {
    Aggregate,
    FormulaItem,
    Group,
    JoinItem,
    JoinStateItem,
    ResourceStatParam,
    ResourceStatState, STAT_OPERATORS,
    StatQuery,
    StatQueryState,
    StatResponse,
} from '@/lib/fluent-api/statistics/type';
import { isNotEmpty } from '@/lib/util';
import { ApiType } from '@/lib/fluent-api/type';


export class Stat<value> extends StatAction<ResourceStatState, StatResponse<value>> {
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
            extraParameter: {
                joinState: [],
            },
            ...initState,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getParameter = (): any => ({
        query: this.query(),
        ...this.getExtraParameter(),
    });


    protected getExtraParameter(): ResourceStatParam {
        const param: ResourceStatParam = { resource_type: this.apiState.extraParameter.resource_type };
        if (isNotEmpty(this.apiState.extraParameter.formulas)) param.formulas = this.apiState.extraParameter.formulas;
        if (this.apiState.extraParameter.data_source_id) param.data_source_id = this.apiState.extraParameter.data_source_id;

        if (isNotEmpty(this.apiState.extraParameter.joinState)) {
            param.join = this.apiState.extraParameter.joinState?.map((j) => {
                const join: JoinItem = {
                    keys: j.keys,
                    resource_type: j.resource_type,
                    query: this.getStatisticsQuery({} as StatQuery, j.query),
                };
                if (j.data_source_id) join.data_source_id = j.data_source_id;
                if (j.type) join.type = j.type;
                return join;
            });
        }

        return param;
    }

    setResourceType(resourceType: string): this {
        const api = this.clone();
        api.apiState.extraParameter.resource_type = resourceType;
        return api;
    }

    setJoin(join: JoinStateItem[]): this {
        const api = this.clone();
        api.apiState.extraParameter.joinState = join;
        return api;
    }

    addJoin(join: JoinStateItem): this {
        const api = this.clone();
        api.apiState.extraParameter.joinState.push(join);
        return api;
    }

    setJoinResourceType(type: string, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].resource_type = type;
        return api;
    }

    setJoinType(type: string, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].type = type;
        return api;
    }

    setJoinKeys(keys: string[], joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].keys = keys;
        return api;
    }

    addJoinKey(key: string, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].keys.push(key);
        return api;
    }

    setJoinQuery(query: StatQueryState<undefined>, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].query = query;
        return api;
    }

    setJoinAggregate(aggregate: Aggregate, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        return api.setAggregate(aggregate, `apiState.extraParameter.joinState[${joinIndex}].query.aggregate`);
    }

    setJoinGroup(group: Group, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        return api.setGroup(group, `apiState.extraParameter.joinState[${joinIndex}].query.aggregate.group`);
    }

    addJoinGroupKey(key: string, name: string, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        return api.addGroupKey(key, name, `apiState.extraParameter.joinState[${joinIndex}].query.aggregate.group.keys`);
    }

    addJoinGroupField(name: string, operator: STAT_OPERATORS, key?: string, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        return api.addGroupField(name, operator, key, `apiState.extraParameter.joinState[${joinIndex}].query.aggregate.group.fields`);
    }

    setJoinSort(name: string, desc = true, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].query.sort = { name, desc };
        return api;
    }

    setJoinLimit(limit: number, joinIndex = 0): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.joinState[joinIndex]) api.apiState.extraParameter.joinState[joinIndex] = getInitJoinState();
        api.apiState.extraParameter.joinState[joinIndex].query.limit = limit;
        return api;
    }

    setFormula(formulas: FormulaItem[]): this {
        const api = this.clone();
        api.apiState.extraParameter.formulas = formulas;
        return api;
    }

    addFormula(name: string, formula: string): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.formulas) api.apiState.extraParameter.formulas = [];
        api.apiState.extraParameter.formulas.push({ name, formula });
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


export default class StatisticsResource extends Resource implements ResourceActions<'stat'> {
    name = 'resource'

    stat<value>(): Stat<value> { return new Stat<value>(this.api, this.baseUrl); }
}
