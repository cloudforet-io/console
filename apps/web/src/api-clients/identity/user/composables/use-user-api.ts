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
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

export const useUserApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('user');

    const actions = {
        create: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.create<UserCreateParameters, UserModel>),
        update: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.update<UserUpdateParameters, UserModel>),
        delete: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.delete<UserDeleteParameters>),
        get: SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>,
        list: SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>,
        enable: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.enable<UserEnableParameters, UserModel>),
        disable: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.disable<UserDisableParameters, UserModel>),
        disableMfa: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.disableMfa<UserDisableMfaParameters, UserModel>),
        verifyEmail: wrapResourceCacheRefresh(SpaceConnector.clientV2.identity.user.verifyEmail<UserVerifyEmailParameters, UserModel>),
    };

    return {
        userAPI: actions,
    };
};
