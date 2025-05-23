import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceChannelCreateParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/create';
import type { ServiceChannelDeleteParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/delete';
import type { ServiceChannelDisableParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/disable';
import type { ServiceChannelEnableParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/enable';
import type { ServiceChannelGetParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/get';
import type { ServiceChannelListParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/list';
import type { ServiceChannelUpdateParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/update';
import type { ServiceChannelModel } from '@/api-clients/alert-manager/service-channel/schema/model';

export const useServiceChannelApi = () => {
    const actions = {
        createForwardChannel: SpaceConnector.clientV2.alertManager.serviceChannel.createForwardChannel<ServiceChannelCreateParameters, ServiceChannelModel>,
        create: SpaceConnector.clientV2.alertManager.serviceChannel.create<ServiceChannelCreateParameters, ServiceChannelModel>,
        delete: SpaceConnector.clientV2.alertManager.serviceChannel.delete<ServiceChannelDeleteParameters>,
        disable: SpaceConnector.clientV2.alertManager.serviceChannel.disable<ServiceChannelDisableParameters>,
        enable: SpaceConnector.clientV2.alertManager.serviceChannel.enable<ServiceChannelEnableParameters>,
        get: SpaceConnector.clientV2.alertManager.serviceChannel.get<ServiceChannelGetParameters, ServiceChannelModel>,
        list: SpaceConnector.clientV2.alertManager.serviceChannel.list<ServiceChannelListParameters, ListResponse<ServiceChannelModel>>,
        update: SpaceConnector.clientV2.alertManager.serviceChannel.update<ServiceChannelUpdateParameters, ServiceChannelModel>,
    };

    return {
        serviceChannelAPI: actions,
    };
};

