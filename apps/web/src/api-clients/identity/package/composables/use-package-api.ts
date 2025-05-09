import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PackageChangeOrderParameters } from '@/api-clients/identity/package/schema/api-verbs/change-order';
import type { PackageCreateParameters } from '@/api-clients/identity/package/schema/api-verbs/create';
import type { PackageDeleteParameters } from '@/api-clients/identity/package/schema/api-verbs/delete';
import type { PackageGetParameters } from '@/api-clients/identity/package/schema/api-verbs/get';
import type { PackageListParameters } from '@/api-clients/identity/package/schema/api-verbs/list';
import type { PackageSetDefaultParameters } from '@/api-clients/identity/package/schema/api-verbs/set-default';
import type { PackageUpdateParameters } from '@/api-clients/identity/package/schema/api-verbs/update';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';


export const usePackageApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.package.create<PackageCreateParameters, PackageModel>,
        update: SpaceConnector.clientV2.identity.package.update<PackageUpdateParameters, PackageModel>,
        delete: SpaceConnector.clientV2.identity.package.delete<PackageDeleteParameters>,
        get: SpaceConnector.clientV2.identity.package.get<PackageGetParameters, PackageModel>,
        list: SpaceConnector.clientV2.identity.package.list<PackageListParameters, ListResponse<PackageModel>>,
        setDefault: SpaceConnector.clientV2.identity.package.setDefault<PackageSetDefaultParameters, PackageModel>,
        changeOrder: SpaceConnector.clientV2.identity.package.changeOrder<PackageChangeOrderParameters, PackageModel>,
    };

    return {
        packageAPI: actions,
    };
};
