import type { ComputedRef } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PackageChangeOrderParameters } from '@/api-clients/identity/package/schema/api-verbs/change-order';
import type { PackageCreateParameters } from '@/api-clients/identity/package/schema/api-verbs/create';
import type { PackageDeleteParameters } from '@/api-clients/identity/package/schema/api-verbs/delete';
import type { PackageGetParameters } from '@/api-clients/identity/package/schema/api-verbs/get';
import type { PackageListParameters } from '@/api-clients/identity/package/schema/api-verbs/list';
import type { PackageSetDefaultParameters } from '@/api-clients/identity/package/schema/api-verbs/set-default';
import type { PackageUpdateParameters } from '@/api-clients/identity/package/schema/api-verbs/update';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';

interface UsePackageApiReturn {
    packageQueryKey: ComputedRef<QueryKey>;
    packageListQueryKey: ComputedRef<QueryKey>;
    packageAPI: {
        create: (params: PackageCreateParameters) => Promise<PackageModel>;
        update: (params: PackageUpdateParameters) => Promise<PackageModel>;
        delete: (params: PackageDeleteParameters) => Promise<void>;
        get: (params: PackageGetParameters) => Promise<PackageModel>;
        list: (params: PackageListParameters) => Promise<ListResponse<PackageModel>>;
        setDefault: (params: PackageSetDefaultParameters) => Promise<PackageModel>;
        changeOrder: (params: PackageChangeOrderParameters) => Promise<PackageModel>;
    }
}

export const usePackageApi = (): UsePackageApiReturn => {
    const packageQueryKey = useAPIQueryKey('identity', 'package', 'get');
    const packageListQueryKey = useAPIQueryKey('identity', 'package', 'list');

    const actions = {
        async create(params: PackageCreateParameters) {
            return SpaceConnector.clientV2.identity.package.create<PackageCreateParameters, PackageModel>(params);
        },
        async update(params: PackageUpdateParameters) {
            return SpaceConnector.clientV2.identity.package.update<PackageUpdateParameters, PackageModel>(params);
        },
        async delete(params: PackageDeleteParameters) {
            return SpaceConnector.clientV2.identity.package.delete<PackageDeleteParameters>(params);
        },
        async get(params: PackageGetParameters) {
            return SpaceConnector.clientV2.identity.package.get<PackageGetParameters, PackageModel>(params);
        },
        async list(params: PackageListParameters) {
            return SpaceConnector.clientV2.identity.package.list<PackageListParameters, ListResponse<PackageModel>>(params);
        },
        async setDefault(params: PackageSetDefaultParameters) {
            return SpaceConnector.clientV2.identity.package.setDefault<PackageSetDefaultParameters, PackageModel>(params);
        },
        async changeOrder(params: PackageChangeOrderParameters) {
            return SpaceConnector.clientV2.identity.package.changeOrder<PackageChangeOrderParameters, PackageModel>(params);
        },
    };

    return {
        packageQueryKey,
        packageListQueryKey,
        packageAPI: actions,
    };
};
