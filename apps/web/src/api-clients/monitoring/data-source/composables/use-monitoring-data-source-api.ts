import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DataSourceGetParameters } from '@/api-clients/monitoring/data-source/schema/api-verbs/get';
import type { DataSourceListParameters } from '@/api-clients/monitoring/data-source/schema/api-verbs/list';
import type { DataSourceModel } from '@/api-clients/monitoring/data-source/schema/model';


export const useMonitoringDataSourceApi = () => {
    const actions = {
        get: SpaceConnector.clientV2.monitoring.dataSource.get<DataSourceGetParameters, DataSourceModel>,
        list: SpaceConnector.clientV2.monitoring.dataSource.list<DataSourceListParameters, ListResponse<DataSourceModel>>,
    };
    return {
        dataSourceAPI: actions,
    };
};
