/* eslint-disable camelcase */
import {
    GetDataAction, ListAction, Resource, ResourceActions, SetParameterAction,
} from '@/lib/fluent-api/toolset';
import { TimeStamp, ListType } from '@/lib/fluent-api/type';
import {
    MetricDataParameter,
    MetricDataResp,
    MetricListResp,
    MetricParameter,
    STATISTICS_TYPE,
} from '@/lib/fluent-api/monitoring/type';

export abstract class MetricAction<param extends MetricParameter, resp> extends SetParameterAction<param, resp> {
    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter.data_source_id = id;
        return api;
    }

    setResourceType(type: string): this {
        this.apiState.parameter.resource_type = type;
        return this.clone();
    }

    setResources(...args: string[]): this {
        this.apiState.parameter.resources = args;
        return this.clone();
    }
}

export class MetricList extends MetricAction<MetricParameter, MetricListResp> {
    path = 'list';

    setId(id: string): this {
        this.apiState.parameter.data_source_id = id;
        return this.clone();
    }

    setResourceType(type: string): this {
        this.apiState.parameter.resource_type = type;
        return this.clone();
    }

    setResources(...args: string[]): this {
        this.apiState.parameter.resources = args;
        return this.clone();
    }
}


export class GetMetricData extends MetricAction<MetricDataParameter, MetricDataResp> {
    path = 'get-data';

    setMetricKey(key: string): this {
        const api = this.clone();
        api.apiState.parameter.metric = key;
        return api;
    }

    setStart(start: TimeStamp): this {
        this.apiState.parameter.start = start;
        return this.clone();
    }

    setEnd(end: TimeStamp): this {
        this.apiState.parameter.end = end;
        return this.clone();
    }

    setPeriod(period: number): this {
        this.apiState.parameter.period = period;
        return this.clone();
    }

    setStat(stat: STATISTICS_TYPE): this {
        this.apiState.parameter.stat = stat;
        return this.clone();
    }
}

export default class Metric extends Resource implements ResourceActions<'list' | 'getData'> {
    protected name = 'metric';

    list(): MetricList { return new MetricList(this.api, this.baseUrl); }

    getData(): GetMetricData { return new GetMetricData(this.api, this.baseUrl); }
}
