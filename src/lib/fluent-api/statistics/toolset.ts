/* eslint-disable camelcase */
import {
    BaseQueryState,
    FilterItem,
} from '@/lib/fluent-api/type';
import { ApiType, BaseQueryAPI } from '@/lib/fluent-api/toolset';
import { isNotEmpty } from '@/lib/util';

export interface StatResponse<value> {
    service_type: string;
    values: value[];
}

export enum OPERATORS {
    value = 'VALUE',
    count = 'COUNT',
    sum = 'SUM',
    average = 'AVERAGE',
    min = 'MIN',
    max = 'MAX'
}

export interface KeyType {
    key: string;
    name: string;
}

export interface FieldType {
    key?: string;
    name: string;
    operator: string;
}

export interface AggregateType {
    group: {
        keys: KeyType[];
        fields: FieldType[];
    };
}
export interface StatisticsQueryState<param> extends BaseQueryState<param> {
    aggregate: AggregateType[];
    sort?: object;
    limit?: number;
}

// export type StatQueryState = StatisticsQueryState<any> {
//
// }

export abstract class StatisticsQueryAPI<parameter, resp> extends BaseQueryAPI<parameter, resp> {
    protected apiState: StatisticsQueryState<parameter> ;

    constructor(
        api: ApiType,
        baseUrl: string,
        initState: any = {},
        transformer: null|((any) => any) = null,
    ) {
        super(api, baseUrl, undefined, transformer);
        this.apiState = {
            aggregate: {},
            filter: [],
            filterOr: [],
            fixFilter: [],
            sort: {},
            limit: undefined,
            extraParameter: {},
            ...initState,
        };
    }

    protected query = (): StatisticsQueryState<parameter> => this.getStatisticsQuery<StatisticsQueryState<parameter>>({} as StatisticsQueryState<parameter>);

    protected getStatisticsQuery<Q extends StatisticsQueryState<parameter>>(query: Q): Q {
        if (isNotEmpty(this.apiState.aggregate)) query.aggregate = this.apiState.aggregate;
        if (isNotEmpty(this.apiState.sort)) query.sort = this.apiState.sort;
        if (isNotEmpty(this.apiState.limit)) query.limit = this.apiState.limit;
        return this.getBaseQuery<StatisticsQueryState<parameter>>(query) as Q;
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    setAggregate(...args: AggregateType[]): this {
        this.apiState.aggregate = args;
        return this.clone();
    }

    setFilter(...args: FilterItem[]): this {
        this.apiState.filter = args;
        return this.clone();
    }

    setFilterOr(...args: FilterItem[]): this {
        this.apiState.filterOr = args;
        return this.clone();
    }

    setSort(key: string, desc = true): this {
        this.apiState.sort = { key, desc };
        return this.clone();
    }

    setLimit(limit: number): this {
        this.apiState.limit = limit;
        return this.clone();
    }
}

// export abstract class StatQueryAPI<parameter, resp> extends StatisticsQueryAPI<parameter, resp> {
//     protected apiState: StatQueryState<parameter> ;
//
//     constructor(
//         api: ApiType,
//         baseUrl: string,
//         initState: StatQueryState<parameter> = {} as StatQueryState<parameter>,
//         transformer: null|((any) => any) = null,
//     ) {
//         super(api, baseUrl, undefined, transformer);
//         this.apiState = {
//             filter: [],
//             filterOr: [],
//             fixFilter: [],
//             sort: {},
//             limit: undefined,
//             extraParameter: {},
//             ...initState,
//         };
//     }
//
//     protected query = (): StatQueryState<any> => {
//         const query: StatQueryState<any> = {
//             resource_type: this.apiState.resource_type,
//         } as StatQueryState<any>;
//         if (this.apiState.join) query.join = this.apiState.join;
//         return this.getStatisticsQuery<StatQueryState<any>>(query);
//     }
// }