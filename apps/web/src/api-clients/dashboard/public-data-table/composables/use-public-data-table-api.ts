import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DataTableLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import type { DataTableAddParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/add';
import type { DataTableDeleteParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/delete';
import type { DataTableGetParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/get';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';
import type { DataTableTransformParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/transform';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';


export const usePublicDataTableApi = () => {
    const action = {
        add: SpaceConnector.clientV2.dashboard.publicDataTable.add<DataTableAddParameters, PublicDataTableModel>,
        transform: SpaceConnector.clientV2.dashboard.publicDataTable.transform<DataTableTransformParameters, PublicDataTableModel>,
        update: SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, PublicDataTableModel>,
        delete: SpaceConnector.clientV2.dashboard.publicDataTable.delete<DataTableDeleteParameters>,
        load: SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, DataTableLoadResponse>,
        get: SpaceConnector.clientV2.dashboard.publicDataTable.get<DataTableGetParameters, PublicDataTableModel>,
        list: SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<PublicDataTableModel>>,
    };

    return {
        publicDataTableAPI: action,
    };
};
