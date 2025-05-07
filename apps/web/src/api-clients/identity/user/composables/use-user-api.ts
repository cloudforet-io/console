import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserCreateParameters } from '@/api-clients/identity/user/schema/api-verbs/create';
import type { UserDeleteParameters } from '@/api-clients/identity/user/schema/api-verbs/delete';
import type { UserDisableParameters } from '@/api-clients/identity/user/schema/api-verbs/disable';
import type { UserDisableMfaParameters } from '@/api-clients/identity/user/schema/api-verbs/disable-mfa';
import type { UserEnableParameters } from '@/api-clients/identity/user/schema/api-verbs/enable';
import type { UserGetParameters } from '@/api-clients/identity/user/schema/api-verbs/get';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import type { UserVerifyEmailParameters } from '@/api-clients/identity/user/schema/api-verbs/verify-email';
import type { UserModel } from '@/api-clients/identity/user/schema/model';

export const useUserApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.user.create<UserCreateParameters, UserModel>,
        update: SpaceConnector.clientV2.identity.user.update<UserUpdateParameters, UserModel>,
        delete: SpaceConnector.clientV2.identity.user.delete<UserDeleteParameters>,
        get: SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>,
        list: SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>,
        enable: SpaceConnector.clientV2.identity.user.enable<UserEnableParameters, UserModel>,
        disable: SpaceConnector.clientV2.identity.user.disable<UserDisableParameters, UserModel>,
        disableMfa: SpaceConnector.clientV2.identity.user.disableMfa<UserDisableMfaParameters, UserModel>,
        verifyEmail: SpaceConnector.clientV2.identity.user.verifyEmail<UserVerifyEmailParameters, UserModel>,
    };

    return {
        userAPI: actions,
    };
};
