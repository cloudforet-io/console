import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserChannelCreateParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/create';
import type { UserChannelDeleteParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/delete';
import type { UserChannelDisableParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/disable';
import type { UserChannelEnableParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/enable';
import type { UserChannelGetParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/get';
import type { UserChannelListParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/list';
import type { UserChannelUpdateParameters } from '@/api-clients/alert-manager/user-channel/schema/api-verbs/update';
import type { UserChannelModel } from '@/api-clients/alert-manager/user-channel/schema/model';

export const useUserChannelApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.userChannel.create<UserChannelCreateParameters, UserChannelModel>,
        delete: SpaceConnector.clientV2.alertManager.userChannel.delete<UserChannelDeleteParameters>,
        disable: SpaceConnector.clientV2.alertManager.userChannel.disable<UserChannelDisableParameters>,
        enable: SpaceConnector.clientV2.alertManager.userChannel.enable<UserChannelEnableParameters>,
        get: SpaceConnector.clientV2.alertManager.userChannel.get<UserChannelGetParameters, UserChannelModel>,
        list: SpaceConnector.clientV2.alertManager.userChannel.list<UserChannelListParameters, ListResponse<UserChannelModel>>,
        update: SpaceConnector.clientV2.alertManager.userChannel.update<UserChannelUpdateParameters, UserChannelModel>,
    };

    return {
        userChannelAPI: actions,
    };
};

