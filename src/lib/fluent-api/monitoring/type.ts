/* eslint-disable camelcase */
import { TimeStamp } from '@/lib/fluent-api';

export enum DataSourceState {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}

export enum MONITORING_TYPE {
    metric = 'METRIC',
    log = 'LOG',
}


export enum STATISTICS_TYPE {
    average = 'AVERAGE',
    max = 'MAXIMUM',
    min = 'MINIMUM'
}


export interface MetricParameter {
    data_source_id: string;
    resource_type: string;
    resources: string[];
}

export interface MetricResp {
    key: string;
    name: string;
    unit: {
        x: string;
        y: string;
    };
    chart_type: string;
    chart_options: any;
}

export interface MetricDataParameter extends MetricParameter {
    metric_key: string;
    start: TimeStamp;
    end: TimeStamp;
    period?: number;
    stat?: STATISTICS_TYPE;
}

export interface MetricDataResp {
    labels: string[];
    resource_values: any[];
}

export interface DataSourceParameter {
    data_source_id?: string;
    name?: string;
    state?: DataSourceState;
    monitoring_type?: MONITORING_TYPE;
    provider?: string;
}

export interface DataSourceResp {
    data_source_id: string;
    name: string;
    state: DataSourceState;
    monitoring_type: MONITORING_TYPE;
    provider: string;
    capability: any;
    plugin_info: {
        plugin_id: string;
        version: string;
        options: {
            supported_resource_type: string[];
            reference_keys: object;
            supported_stat?: STATISTICS_TYPE[];
            filter_format?: any;
            view: object[];
        };
        secret_id?: string;
        provider?: string;
    };
    tags: object;
    created_at: TimeStamp;
}
