/* eslint-disable camelcase */
import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import { StatAction } from '@/lib/fluent-api/statistics/toolset';
import {
    FormulaItem, JoinItem, ResourceStatParam, StatResponse,
} from '@/lib/fluent-api/statistics/type';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Stat<value, joinParam=any> extends StatAction<ResourceStatParam<joinParam>, StatResponse<value>> {
    setResourceType(resourceType: string): this {
        this.apiState.extraParameter.resource_type = resourceType;
        return this.clone();
    }

    setJoin(join: JoinItem<joinParam>[]): this {
        this.apiState.extraParameter.join = join;
        return this.clone();
    }

    setFormula(formulas: FormulaItem[]): this {
        this.apiState.extraParameter.formulas = formulas;
        return this.clone();
    }

    setSort(name: string, desc = true): this {
        this.apiState.sort = { name, desc };
        return this.clone();
    }

    setLimit(limit: number): this {
        this.apiState.limit = limit;
        return this.clone();
    }
}


export default class StatisticsResource extends Resource implements ResourceActions<'stat'> {
    name = 'resource'

    stat<value, joinParam>(): Stat<value, joinParam> { return new Stat<value, joinParam>(this.api, this.baseUrl); }
}
