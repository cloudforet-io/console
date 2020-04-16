/* eslint-disable camelcase */
import {
    BaseQuery,
    BaseQueryState,
    FilterItem, FilterType, TimeStamp,
} from '@/lib/fluent-api/type';
import { BaseQueryAPI } from '@/lib/fluent-api/toolset';
import { isNotEmpty } from '@/lib/util';

export interface StatResponse<value> {
    service_type: string;
    values: value[];
}

export interface HistoryResponse<value> {
    topic: string;
    values: value[];
}

export interface DiffResponse<value, field> {
    topic: string;
    values: Array<value & field>;
}

export enum OPERATORS {
    value = 'VALUE',
    count = 'COUNT',
    sum = 'SUM',
    average = 'AVERAGE',
    min = 'MIN',
    max = 'MAX'
}

export interface FieldType {
    key: string;
    operator: OPERATORS;
    alias: string;
}


export interface StatisticsQuery extends BaseQuery {
    fields: FieldType[];
    group_by?: string[];
    filter?: FilterType[];
    filter_or?: FilterType[];
    sort?: object;
    limit?: number;
}

export interface StatisticsQueryState<param> extends BaseQueryState<param> {
    fields: FieldType[];
    groupBy: Array<string>;
    sort: object;
    limit?: number;
}

export interface StatQuery extends StatisticsQuery {
    data_source?: string;
    service_type: string;
}

export interface StatQueryState<param> extends StatisticsQueryState<param> {
    serviceType: string;
    dataSource?: string;
}

export interface HistoryQuery extends StatisticsQuery {
    topic: string;
}

export interface HistoryQueryState<param> extends StatisticsQueryState<param> {
    topic: string;
}

export interface DiffQuery extends BaseQuery {
    topic: string;
    field: string;
    from: TimeStamp;
    group_by?: string[];
}

export interface DiffQueryState<param> extends BaseQueryState<param> {
    topic: string;
    field: string;
    from?: TimeStamp;
    groupBy: Array<string>;
}

export abstract class StatisticsQueryAPI<parameter, resp> extends BaseQueryAPI<parameter, resp> {
    protected apiState: StatisticsQueryState<parameter> ;

    protected constructor(
        baseUrl: string,
        initState: StatisticsQueryState<parameter> = {} as StatisticsQueryState<parameter>,
        transformer: null|((any) => any) = null,
    ) {
        super(baseUrl, undefined, transformer);
        this.apiState = {
            fields: [],
            groupBy: [],
            filter: [],
            filterOr: [],
            fixFilter: [],
            sort: {},
            limit: undefined,
            extraParameter: {},
            ...initState,
        };
    }

    protected abstract query = (): StatisticsQuery => this.getStatisticsQuery<StatisticsQuery>({} as StatisticsQuery);

    protected getStatisticsQuery<Q extends StatisticsQuery>(query: Q): Q {
        if (isNotEmpty(this.apiState.fields)) query.fields = this.apiState.fields;
        if (isNotEmpty(this.apiState.groupBy)) query.group_by = this.apiState.groupBy;
        if (isNotEmpty(this.apiState.sort)) query.sort = this.apiState.sort;
        if (isNotEmpty(this.apiState.limit)) query.limit = this.apiState.limit;
        return this.getBaseQuery<StatisticsQuery>(query) as Q;
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    addField(key: string, operator: OPERATORS, alias: string): this {
        this.apiState.fields.push({ key, operator, alias });
        return this.clone();
    }

    setFields(...args: FieldType[]): this {
        this.apiState.fields = args;
        return this.clone();
    }

    setGroupBy(...args: string[]): this {
        this.apiState.groupBy = args;
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

export abstract class StatQueryAPI<parameter, resp> extends StatisticsQueryAPI<parameter, resp> {
    protected apiState: StatQueryState<parameter> ;

    constructor(
        baseUrl: string,
        initState: StatQueryState<parameter> = {} as StatQueryState<parameter>,
        transformer: null|((any) => any) = null,
    ) {
        super(baseUrl, undefined, transformer);
        this.apiState = {
            serviceType: '',
            dataSource: undefined,
            fields: [],
            groupBy: [],
            filter: [],
            filterOr: [],
            fixFilter: [],
            sort: {},
            limit: undefined,
            extraParameter: {},
            ...initState,
        };
    }

    protected query = (): StatQuery => {
        const query: StatQuery = {
            service_type: this.apiState.serviceType,
        } as StatQuery;
        if (this.apiState.dataSource) query.data_source = this.apiState.dataSource;
        return this.getStatisticsQuery<StatQuery>(query);
    }

    setServiceType(serviceType: string): this {
        this.apiState.serviceType = serviceType;
        return this.clone();
    }

    setDataSource(dataSource: string): this {
        this.apiState.dataSource = dataSource;
        return this.clone();
    }
}


export abstract class HistoryQueryAPI<parameter, resp> extends StatisticsQueryAPI<parameter, resp> {
    protected apiState: HistoryQueryState<parameter> ;

    constructor(
        baseUrl: string,
        initState: HistoryQueryState<parameter> = {} as HistoryQueryState<parameter>,
        transformer: null|((any) => any) = null,
    ) {
        super(baseUrl, undefined, transformer);
        this.apiState = {
            topic: '',
            fields: [],
            groupBy: [],
            filter: [],
            filterOr: [],
            fixFilter: [],
            sort: {},
            limit: undefined,
            extraParameter: {},
            ...initState,
        };
    }

    protected query = (): HistoryQuery => {
        const query: HistoryQuery = {
            topic: this.apiState.topic,
        } as HistoryQuery;
        return this.getStatisticsQuery<HistoryQuery>(query);
    }

    setTopic(topic: string): this {
        this.apiState.topic = topic;
        return this.clone();
    }
}


export abstract class DiffQueryAPI<parameter, resp> extends BaseQueryAPI<parameter, resp> {
    protected apiState: DiffQueryState<parameter> ;

    constructor(
        baseUrl: string,
        initState: DiffQueryState<parameter> = {} as DiffQueryState<parameter>,
        transformer: null|((any) => any) = null,
    ) {
        super(baseUrl, undefined, transformer);
        this.apiState = {
            topic: '',
            field: '',
            from: undefined,
            groupBy: [],
            filter: [],
            filterOr: [],
            fixFilter: [],
            extraParameter: {},
            ...initState,
        };
    }

    getParameter = (): any => ({
        query: this.query(),
        ...this.apiState.extraParameter,
    });

    protected query = (): DiffQuery => {
        const query: DiffQuery = {
            topic: this.apiState.topic,
            field: this.apiState.field,
            from: this.apiState.from,
        } as DiffQuery;
        if (isNotEmpty(this.apiState.groupBy)) query.group_by = this.apiState.groupBy;
        return this.getBaseQuery<DiffQuery>(query);
    }

    setTopic(topic: string): this {
        this.apiState.topic = topic;
        return this.clone();
    }

    setField(field: string): this {
        this.apiState.field = field;
        return this.clone();
    }

    setFrom(timestamp: TimeStamp): this {
        this.apiState.from = timestamp;
        return this.clone();
    }

    setGroupBy(...args: string[]): this {
        this.apiState.groupBy = args;
        return this.clone();
    }
}
