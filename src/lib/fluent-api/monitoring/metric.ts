/* eslint-disable camelcase */
import {
    GetDataAction, ListAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';
import { TimeStamp, ListType } from '@/lib/fluent-api/type';
import {
    MetricDataParameter,
    MetricDataResp,
    MetricParameter,
    MetricResp,
    STATISTICS_TYPE,
} from '@/lib/fluent-api/monitoring/type';

class List extends ListAction<MetricParameter, ListType<MetricResp>> {
    setId(id: string): this {
        this.apiState.extraParameter.data_source_id = id;
        return this.clone();
    }

    setResourceType(type: string): this {
        this.apiState.extraParameter.resource_type = type;
        return this.clone();
    }

    setResources(...args: string[]): this {
        this.apiState.extraParameter.resources = args;
        return this.clone();
    }
}


class GetData extends GetDataAction<MetricDataParameter, MetricDataResp> {
    idField = 'data_source_id';

    setMetricKey(key: string): this {
        this.apiState.extraParameter.metric_key = key;
        return this.clone();
    }

    setStart(start: TimeStamp): this {
        this.apiState.extraParameter.start = start;
        return this.clone();
    }

    setEnd(end: TimeStamp): this {
        this.apiState.extraParameter.end = end;
        return this.clone();
    }

    setPeriod(period: number): this {
        this.apiState.extraParameter.period = period;
        return this.clone();
    }

    setStat(stat: STATISTICS_TYPE): this {
        this.apiState.extraParameter.stat = stat;
        return this.clone();
    }
}

export default class Metric extends Resource implements ResourceActions<'list' | 'getData'> {
    protected name = 'metric';

    list(): List { return new List(this.api, this.baseUrl); }

    getData(): GetData { return new GetData(this.api, this.baseUrl); }
}
