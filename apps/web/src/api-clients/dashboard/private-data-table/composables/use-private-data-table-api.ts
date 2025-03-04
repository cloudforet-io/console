import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
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

interface UsePrivateDataTableApiReturn {
    privateDataTableGetQueryKey: ComputedRef<QueryKey>;
    privateDataTableListQueryKey: ComputedRef<QueryKey>;
    privateDataTableLoadQueryKey: ComputedRef<QueryKey>;
    privateDataTableAPI: {
        add: (params: DataTableAddParameters) => Promise<PrivateDataTableModel>;
        transform: (params: DataTableTransformParameters) => Promise<PrivateDataTableModel>;
        update: (params: DataTableUpdateParameters) => Promise<PrivateDataTableModel>;
        delete: (params: DataTableDeleteParameters) => Promise<void>;
        load: (params: DataTableLoadParameters) => Promise<DataTableLoadResponse>;
        get: (params: DataTableGetParameters) => Promise<PrivateDataTableModel>;
        list: (params: DataTableListParameters) => Promise<ListResponse<PrivateDataTableModel>>;
    }
}

export const usePrivateDataTableApi = (): UsePrivateDataTableApiReturn => {
    const privateDataTableGetQueryKey = useAPIQueryKey('dashboard', 'private-data-table', 'get');
    const privateDataTableListQueryKey = useAPIQueryKey('dashboard', 'private-dashboard', 'list');
    const privateDataTableLoadQueryKey = useAPIQueryKey('dashboard', 'private-dashboard', 'list');

    const action = {
        async add(params: DataTableAddParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.add<DataTableAddParameters, PrivateDataTableModel>(params);
        },
        async transform(params: DataTableTransformParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.transform<DataTableTransformParameters, PrivateDataTableModel>(params);
        },
        async update(params: DataTableUpdateParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.update<DataTableUpdateParameters, PrivateDataTableModel>(params);
        },
        async delete(params: DataTableDeleteParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.delete<DataTableDeleteParameters>(params);
        },
        async load(params: DataTableLoadParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.load<DataTableLoadParameters, DataTableLoadResponse>(params);
        },
        async get(params: DataTableGetParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.get<DataTableGetParameters, PrivateDataTableModel>(params);
        },
        async list(params: DataTableListParameters) {
            return SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<PrivateDataTableModel>>(params);
        },
    };

    return {
        privateDataTableGetQueryKey,
        privateDataTableListQueryKey,
        privateDataTableLoadQueryKey,
        privateDataTableAPI: action,
    };
};
