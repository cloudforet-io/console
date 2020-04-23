/* eslint-disable camelcase */
import { ApiType, Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import { StatQueryAPI, StatResponse } from '@/lib/fluent-api/statistics/toolset';
import { StatisticsQueryAPI, StatisticsQueryState } from '@/lib/fluent-api/statistics/toolset';

interface JoinType extends StatisticsQueryState<any> {
    key: string;
    resource_type: string;
}

interface FormulaType {
    name: string;
    formula: string;
}


interface StatQueryParam {
    resource_type: string;
    join: JoinType[];
    formulas: FormulaType[];
}

class Query<value> extends StatisticsQueryAPI<StatQueryParam, StatResponse<value>> {
    path = 'query'

    setResourceType(resourceType: string): this {
        this.apiState.extraParameter.resource_type = resourceType;
        return this.clone();
    }

    setJoin(join: JoinType[]): this {
        this.apiState.extraParameter.join = join;
        return this.clone();
    }

    setFormula(formulas: FormulaType[]): this {
        this.apiState.extraParameter.formulas = formulas;
        return this.clone();
    }
}


export default class Stat extends Resource implements ResourceActions<'query'> {
    name = 'stat'

    query<value>(): Query<value> { return new Query<value>(this.api, this.baseUrl); }
}
