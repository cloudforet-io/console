import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserGroupChannelCreateParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/create';
import type { UserGroupChannelDeleteParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/delete';
import type { UserGroupChannelDisableParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/disable';
import type { UserGroupChannelEnableParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/enable';
import type { UserGroupChannelGetParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/get';
import type { UserGroupChannelListParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/list';
import type { UserGroupChannelUpdateParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/update';
import type { UserGroupChannelModel } from '@/api-clients/alert-manager/user-group-channel/schema/model';

export const useUserGroupChannelApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.userGroupChannel.create<UserGroupChannelCreateParameters, UserGroupChannelModel>,
        delete: SpaceConnector.clientV2.alertManager.userGroupChannel.delete<UserGroupChannelDeleteParameters>,
        disable: SpaceConnector.clientV2.alertManager.userGroupChannel.disable<UserGroupChannelDisableParameters>,
        enable: SpaceConnector.clientV2.alertManager.userGroupChannel.enable<UserGroupChannelEnableParameters>,
        get: SpaceConnector.clientV2.alertManager.userGroupChannel.get<UserGroupChannelGetParameters, UserGroupChannelModel>,
        list: SpaceConnector.clientV2.alertManager.userGroupChannel.list<UserGroupChannelListParameters, ListResponse<UserGroupChannelModel>>,
        update: SpaceConnector.clientV2.alertManager.userGroupChannel.update<UserGroupChannelUpdateParameters, UserGroupChannelModel>,
    };

    return {
        userGroupChannelAPI: actions,
    };
};

