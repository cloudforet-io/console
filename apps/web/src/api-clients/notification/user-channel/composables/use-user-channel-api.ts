import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserChannelCreateParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/create';
import type { UserChannelDeleteParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/delete';
import type { UserChannelDisableParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/disable';
import type { UserChannelEnableParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/enable';
import type { UserChannelGetParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/get';
import type { UserChannelListParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/list';
import type { UserChannelSetScheduleParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/set-schedule';
import type { UserChannelSetSubscriptionParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/set-subscription';
import type { UserChannelUpdateParameters } from '@/api-clients/notification/user-channel/schema/api-verbs/update';
import type { UserChannelModel } from '@/api-clients/notification/user-channel/schema/model';


export const useUserChannelApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.notification.userChannel.create<UserChannelCreateParameters, UserChannelModel>,
        delete: SpaceConnector.clientV2.notification.userChannel.delete<UserChannelDeleteParameters>,
        disable: SpaceConnector.clientV2.notification.userChannel.disable<UserChannelDisableParameters, UserChannelModel>,
        enable: SpaceConnector.clientV2.notification.userChannel.enable<UserChannelEnableParameters, UserChannelModel>,
        get: SpaceConnector.clientV2.notification.userChannel.get<UserChannelGetParameters, UserChannelModel>,
        list: SpaceConnector.clientV2.notification.userChannel.list<UserChannelListParameters, ListResponse<UserChannelModel>>,
        setSchedule: SpaceConnector.clientV2.notification.userChannel.setSchedule<UserChannelSetScheduleParameters, UserChannelModel>,
        setSubscription: SpaceConnector.clientV2.notification.userChannel.setSubscription<UserChannelSetSubscriptionParameters, UserChannelModel>,
        update: SpaceConnector.clientV2.notification.userChannel.update<UserChannelUpdateParameters, UserChannelModel>,
    };
    return {
        userChannelAPI: actions,
    };
};
