import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserGroupAddUsersParameters } from '@/api-clients/identity/user-group/schema/api-verbs/add-users';
import type { UserGroupCreateParameters } from '@/api-clients/identity/user-group/schema/api-verbs/create';
import type { UserGroupDeleteUserGroupParameters } from '@/api-clients/identity/user-group/schema/api-verbs/delete';
import type { UserGroupGetParameters } from '@/api-clients/identity/user-group/schema/api-verbs/get';
import type { UserGroupListParameters } from '@/api-clients/identity/user-group/schema/api-verbs/list';
import type { UserGroupRemoveUsersParameters } from '@/api-clients/identity/user-group/schema/api-verbs/remove-users';
import type { UserGroupUpdateParameters } from '@/api-clients/identity/user-group/schema/api-verbs/update';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';


export const useUserGroupApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.userGroup.create<UserGroupCreateParameters, UserGroupModel>,
        update: SpaceConnector.clientV2.identity.userGroup.update<UserGroupUpdateParameters, UserGroupModel>,
        delete: SpaceConnector.clientV2.identity.userGroup.delete<UserGroupDeleteUserGroupParameters>,
        get: SpaceConnector.clientV2.identity.userGroup.get<UserGroupGetParameters, UserGroupModel>,
        list: SpaceConnector.clientV2.identity.userGroup.list<UserGroupListParameters, ListResponse<UserGroupModel>>,
        addUsers: SpaceConnector.clientV2.identity.userGroup.addUsers<UserGroupAddUsersParameters, UserGroupModel>,
        removeUsers: SpaceConnector.clientV2.identity.userGroup.removeUsers<UserGroupRemoveUsersParameters, UserGroupModel>,
    };

    return {
        userGroupAPI: actions,
    };
};
