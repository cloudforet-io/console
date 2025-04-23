import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DataTableLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { DataTableAddParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/add';
import type { DataTableDeleteParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/delete';
import type { DataTableGetParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';
import type { DataTableTransformParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/transform';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';

export const usePrivateDataTableApi = () => {
    const action = {
        add: SpaceConnector.clientV2.dashboard.privateDataTable.add<DataTableAddParameters, PrivateDataTableModel>,
        transform: SpaceConnector.clientV2.dashboard.privateDataTable.transform<DataTableTransformParameters, PrivateDataTableModel>,
        update: SpaceConnector.clientV2.dashboard.privateDataTable.update<DataTableUpdateParameters, PrivateDataTableModel>,
        delete: SpaceConnector.clientV2.dashboard.privateDataTable.delete<DataTableDeleteParameters>,
        load: SpaceConnector.clientV2.dashboard.privateDataTable.load<DataTableLoadParameters, DataTableLoadResponse>,
        get: SpaceConnector.clientV2.dashboard.privateDataTable.get<DataTableGetParameters, PrivateDataTableModel>,
        list: SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<PrivateDataTableModel>>,
    };

    return {
        privateDataTableAPI: action,
    };
};
