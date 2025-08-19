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
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

export const useProtocolApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('protocol');

    const actions = {
        create: wrapResourceCacheRefresh(SpaceConnector.clientV2.notification.protocol.create<ProtocolCreateParameters, ProtocolModel>),
        delete: wrapResourceCacheRefresh(SpaceConnector.clientV2.notification.protocol.delete<ProtocolDeleteParameters>),
        disable: wrapResourceCacheRefresh(SpaceConnector.clientV2.notification.protocol.disable<ProtocolDisableParameters, ProtocolModel>),
        enable: wrapResourceCacheRefresh(SpaceConnector.clientV2.notification.protocol.enable<ProtocolEnableParameters, ProtocolModel>),
        get: SpaceConnector.clientV2.notification.protocol.get<ProtocolGetParameters, ProtocolModel>,
        list: SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>,
        update: wrapResourceCacheRefresh(SpaceConnector.clientV2.notification.protocol.update<ProtocolUpdateParameters, ProtocolModel>),
        updatePlugin: wrapResourceCacheRefresh(SpaceConnector.clientV2.notification.protocol.updatePlugin<ProtocolUpdatePluginParameters, ProtocolModel>),
    };
    return {
        protocolAPI: actions,
    };
};
