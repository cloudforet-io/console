import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationProtocolCreateParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/create';
import type { NotificationProtocolDeleteParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/delete';
import type { NotificationProtocolDisableParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/disable';
import type { NotificationProtocolEnableParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/enable';
import type { NotificationProtocolGetParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/get';
import type { NotificationProtocolListParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/list';
import type { NotificationProtocolUpdateParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/update';
import type { NotificationProtocolUpdatePluginParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/update-plugin';
import type { NotificationProtocolVerifyPluginParameters } from '@/api-clients/alert-manager/notification-protocol/schema/api-verbs/verify-plugin';
import type { NotificationProtocolModel } from '@/api-clients/alert-manager/notification-protocol/schema/model';

export const useNotificationProtocolApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.notificationProtocol.create<NotificationProtocolCreateParameters, NotificationProtocolModel>,
        delete: SpaceConnector.clientV2.alertManager.notificationProtocol.delete<NotificationProtocolDeleteParameters>,
        disable: SpaceConnector.clientV2.alertManager.notificationProtocol.disable<NotificationProtocolDisableParameters>,
        enable: SpaceConnector.clientV2.alertManager.notificationProtocol.enable<NotificationProtocolEnableParameters>,
        get: SpaceConnector.clientV2.alertManager.notificationProtocol.get<NotificationProtocolGetParameters, NotificationProtocolModel>,
        list: SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>,
        updatePlugin: SpaceConnector.clientV2.alertManager.notificationProtocol.updatePlugin<NotificationProtocolUpdatePluginParameters, NotificationProtocolModel>,
        update: SpaceConnector.clientV2.alertManager.notificationProtocol.update<NotificationProtocolUpdateParameters, NotificationProtocolModel>,
        verifyPlugin: SpaceConnector.clientV2.alertManager.notificationProtocol.verifyPlugin<NotificationProtocolVerifyPluginParameters, NotificationProtocolModel>,
    };

    return {
        notificationProtocolAPI: actions,
    };
};

