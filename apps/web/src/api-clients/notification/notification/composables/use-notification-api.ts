import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationCreateParameters } from '@/api-clients/notification/notification/schema/api-verbs/create';
import type { NotificationDeleteParameters } from '@/api-clients/notification/notification/schema/api-verbs/delete';
import type { NotificationGetParameters } from '@/api-clients/notification/notification/schema/api-verbs/get';
import type { NotificationListParameters } from '@/api-clients/notification/notification/schema/api-verbs/list';
import type { NotificationPushParameters } from '@/api-clients/notification/notification/schema/api-verbs/push';
import type { NotificationSetReadParameters } from '@/api-clients/notification/notification/schema/api-verbs/set-read';
import type { NotificationModel } from '@/api-clients/notification/notification/schema/model';


export const useNotificationApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.notification.notification.create<NotificationCreateParameters, NotificationModel>,
        delete: SpaceConnector.clientV2.notification.notification.delete<NotificationDeleteParameters>,
        get: SpaceConnector.clientV2.notification.notification.get<NotificationGetParameters, NotificationModel>,
        list: SpaceConnector.clientV2.notification.notification.list<NotificationListParameters, ListResponse<NotificationModel>>,
        push: SpaceConnector.clientV2.notification.notification.push<NotificationPushParameters, NotificationModel>,
        setRead: SpaceConnector.clientV2.notification.notification.setRead<NotificationSetReadParameters, NotificationModel>,
    };
    return {
        notificationAPI: actions,
    };
};
