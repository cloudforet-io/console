import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-query-key';
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


interface UsePublicDataTableApiReturn {
    publicDataTableQueryKey: ComputedRef<QueryKey>;
    publicDataTableListQueryKey: ComputedRef<QueryKey>;
    publicDataTableLoadQueryKey: ComputedRef<QueryKey>;
    publicDataTableAPI: {
        add: (params: DataTableAddParameters) => Promise<PublicDataTableModel>;
        transform: (params: DataTableTransformParameters) => Promise<PublicDataTableModel>;
        update: (params: DataTableUpdateParameters) => Promise<PublicDataTableModel>;
        delete: (params: DataTableDeleteParameters) => Promise<void>;
        load: (params: DataTableLoadParameters) => Promise<DataTableLoadResponse>;
        get: (params: DataTableGetParameters) => Promise<PublicDataTableModel>;
        list: (params: DataTableListParameters) => Promise<ListResponse<PublicDataTableModel>>;
    }
}

export const usePublicDataTableApi = (): UsePublicDataTableApiReturn => {
    const publicDataTableQueryKey = useAPIQueryKey('public-data-table/get');
    const publicDataTableListQueryKey = useAPIQueryKey('public-data-table/list');
    const publicDataTableLoadQueryKey = useAPIQueryKey('public-data-table/load');

    const action = {
        async add(params: DataTableAddParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.add<DataTableAddParameters, PublicDataTableModel>(params);
        },
        async transform(params: DataTableTransformParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.transform<DataTableTransformParameters, PublicDataTableModel>(params);
        },
        async update(params: DataTableUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, PublicDataTableModel>(params);
        },
        async delete(params: DataTableDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.delete<DataTableDeleteParameters>(params);
        },
        async load(params: DataTableLoadParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, DataTableLoadResponse>(params);
        },
        async get(params: DataTableGetParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.get<DataTableGetParameters, PublicDataTableModel>(params);
        },
        async list(params: DataTableListParameters) {
            return SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<PublicDataTableModel>>(params);
        },
    };

    return {
        publicDataTableQueryKey,
        publicDataTableListQueryKey,
        publicDataTableLoadQueryKey,
        publicDataTableAPI: action,
    };
};
