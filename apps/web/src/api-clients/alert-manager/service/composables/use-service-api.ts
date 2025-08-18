import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceChangeMembersParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/change-members';
import type { ServiceCreateParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/create';
import type { ServiceDeleteParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/delete';
import type { ServiceGetParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/get';
import type { ServiceListParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/list';
import type { ServiceUpdateParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/update';
import type { ServiceModel } from '@/api-clients/alert-manager/service/schema/model';

export const useServiceApi = () => {
    const actions = {
        changeMembers: SpaceConnector.clientV2.alertManager.service.changeMembers<ServiceChangeMembersParameters, ServiceModel>,
        create: SpaceConnector.clientV2.alertManager.service.create<ServiceCreateParameters, ServiceModel>,
        delete: SpaceConnector.clientV2.alertManager.service.delete<ServiceDeleteParameters>,
        get: SpaceConnector.clientV2.alertManager.service.get<ServiceGetParameters, ServiceModel>,
        list: SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>,
        update: SpaceConnector.clientV2.alertManager.service.update<ServiceUpdateParameters, ServiceModel>,
    };

    return {
        serviceAPI: actions,
    };
};

