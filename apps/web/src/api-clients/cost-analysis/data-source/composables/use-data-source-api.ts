import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceGetParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/get';
import type { CostDataSourceListParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/list';
import type { CostDataSourceSyncParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/sync';
import type { CostDataSourceUpdatePermissionsParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/update-permissions';
import type { CostDataSourceModel } from '@/api-clients/cost-analysis/data-source/schema/model';
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

export const useDataSourceApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('costDataSource');

    const actions = {
        get: SpaceConnector.clientV2.costAnalysis.dataSource.get<CostDataSourceGetParameters, CostDataSourceModel>,
        list: SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<CostDataSourceModel>>,
        sync: wrapResourceCacheRefresh(SpaceConnector.clientV2.costAnalysis.dataSource.sync<CostDataSourceSyncParameters>),
        updatePermissions: wrapResourceCacheRefresh(SpaceConnector.clientV2.costAnalysis.dataSource.updatePermissions<CostDataSourceUpdatePermissionsParameters, CostDataSourceModel>),
    };

    return {
        dataSourceAPI: actions,
    };
};
