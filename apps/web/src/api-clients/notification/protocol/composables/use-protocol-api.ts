import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProtocolCreateParameters } from '@/api-clients/notification/protocol/schema/api-verbs/create';
import type { ProtocolDeleteParameters } from '@/api-clients/notification/protocol/schema/api-verbs/delete';
import type { ProtocolDisableParameters } from '@/api-clients/notification/protocol/schema/api-verbs/disable';
import type { ProtocolEnableParameters } from '@/api-clients/notification/protocol/schema/api-verbs/enable';
import type { ProtocolGetParameters } from '@/api-clients/notification/protocol/schema/api-verbs/get';
import type { ProtocolListParameters } from '@/api-clients/notification/protocol/schema/api-verbs/list';
import type { ProtocolUpdateParameters } from '@/api-clients/notification/protocol/schema/api-verbs/update';
import type { ProtocolUpdatePluginParameters } from '@/api-clients/notification/protocol/schema/api-verbs/update-plugin';
import type { ProtocolModel } from '@/api-clients/notification/protocol/schema/model';


export const useProtocolApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.notification.protocol.create<ProtocolCreateParameters, ProtocolModel>,
        delete: SpaceConnector.clientV2.notification.protocol.delete<ProtocolDeleteParameters>,
        disable: SpaceConnector.clientV2.notification.protocol.disable<ProtocolDisableParameters, ProtocolModel>,
        enable: SpaceConnector.clientV2.notification.protocol.enable<ProtocolEnableParameters, ProtocolModel>,
        get: SpaceConnector.clientV2.notification.protocol.get<ProtocolGetParameters, ProtocolModel>,
        list: SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>,
        update: SpaceConnector.clientV2.notification.protocol.update<ProtocolUpdateParameters, ProtocolModel>,
        updatePlugin: SpaceConnector.clientV2.notification.protocol.updatePlugin<ProtocolUpdatePluginParameters, ProtocolModel>,
    };
    return {
        protocolAPI: actions,
    };
};
