/* eslint-disable camelcase */
import {
    ListAction, Resource, ResourceActions, SetParameterAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType,
} from '@/lib/fluent-api/type';
import {
    MONITORING_TYPE,
    DataSourceParameter,
    DataSourceResp,
    DataSourceState,
} from '@/lib/fluent-api/monitoring/type';


class List extends SetParameterAction<DataSourceParameter, ListType<DataSourceResp>> {
    path = 'list';

    setId(id: string): this {
        this.apiState.parameter.data_source_id = id;
        return this.clone();
    }

    setName(name: string): this {
        this.apiState.parameter.name = name;
        return this.clone();
    }

    setState(state: DataSourceState): this {
        this.apiState.parameter.state = state;
        return this.clone();
    }

    setMonitoringType(type: MONITORING_TYPE): this {
        this.apiState.parameter.monitoring_type = type;
        return this.clone();
    }

    setProvider(provider: string): this {
        this.apiState.parameter.provider = provider;
        return this.clone();
    }
}
export default class DataSource extends Resource implements ResourceActions<'list'> {
    protected name = 'data-source';

    list() { return new List(this.api, this.baseUrl); }
}
