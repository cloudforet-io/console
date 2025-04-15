import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceGetParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/get';
import type { CostDataSourceListParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/list';
import type { CostDataSourceSyncParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/sync';
import type { CostDataSourceUpdatePermissionsParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/update-permissions';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';

interface UseDataSourceApiReturn {
    dataSourceAPI: {
        get: (params: CostDataSourceGetParameters) => Promise<CostDataSourceModel>;
        list: (params: CostDataSourceListParameters) => Promise<ListResponse<CostDataSourceModel>>;
        sync: (params: CostDataSourceSyncParameters) => Promise<void>;
        updatePermissions: (params: CostDataSourceUpdatePermissionsParameters) => Promise<CostDataSourceModel>;
    }
}

export const useDataSourceApi = (): UseDataSourceApiReturn => {
    const actions = {
        async get(params: CostDataSourceGetParameters) {
            return SpaceConnector.clientV2.costAnalysis.dataSource.get<CostDataSourceGetParameters, CostDataSourceModel>(params);
        },
        async list(params: CostDataSourceListParameters) {
            return SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<CostDataSourceModel>>(params);
        },
        async sync(params: CostDataSourceSyncParameters) {
            return SpaceConnector.clientV2.costAnalysis.dataSource.sync<CostDataSourceSyncParameters>(params);
        },
        async updatePermissions(params: CostDataSourceUpdatePermissionsParameters) {
            return SpaceConnector.clientV2.costAnalysis.dataSource.updatePermissions<CostDataSourceUpdatePermissionsParameters, CostDataSourceModel>(params);
        },
    };

    return {
        dataSourceAPI: actions,
    };
};
