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
        console.debug('id', id);
        return api;
    }

    setResourceType(type: string): this {
        const api = this.clone();
        api.apiState.parameter.resource_type = type;
        return api;
    }

    setResources(...args: string[]): this {
        const api = this.clone();
        if (args.length > 0) api.apiState.parameter.resources = args;
        return api;
    }
}

export class MetricList extends MetricAction<MetricParameter, MetricListResp> {
    path = 'list';
}


export class GetMetricData extends MetricAction<MetricDataParameter, MetricDataResp> {
    path = 'get-data';

    setMetricKey(key: string): this {
        const api = this.clone();
        api.apiState.parameter.metric = key;
        return api;
    }

    setStart(start: TimeStamp): this {
        const api = this.clone();
        api.apiState.parameter.start = start;
        return api;
    }

    setEnd(end: TimeStamp): this {
        const api = this.clone();
        api.apiState.parameter.end = end;
        return api;
    }

    setPeriod(period: number): this {
        const api = this.clone();
        api.apiState.parameter.period = period;
        return api;
    }

    setStat(stat: STATISTICS_TYPE): this {
        const api = this.clone();
        api.apiState.parameter.stat = stat;
        return api;
    }
}

export default class Metric extends Resource implements ResourceActions<'list' | 'getData'> {
    protected name = 'metric';

    list(): MetricList { return new MetricList(this.api, this.baseUrl); }

    getData(): GetMetricData { return new GetMetricData(this.api, this.baseUrl); }
}
