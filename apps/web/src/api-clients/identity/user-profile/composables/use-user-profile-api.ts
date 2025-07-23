import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserProfileConfirmEmailParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/confirm-email';
import type { UserProfileConfirmMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/confirm-mfa';
import type { UserProfileDisableMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/disable-mfa';
import type { UserProfileEnableMfaParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/enable-mfa';
import type { UserProfileGetWorkspacesParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/get-workspaces';
import type { UserProfileResetPasswordParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/reset-password';
import type { UserProfileUpdateParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update';
import type { UserProfileUpdatePasswordParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update-password';
import type { UserProfileVerifyEmailParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/verify-email';
import type { UserModel } from '@/api-clients/identity/user/schema/model';



export const useUserProfileApi = () => {
    const actions = {
        update: SpaceConnector.clientV2.identity.userProfile.update<UserProfileUpdateParameters, any>,
        updatePassword: SpaceConnector.clientV2.identity.userProfile.updatePassword<UserProfileUpdatePasswordParameters, any>,
        resetPassword: SpaceConnector.clientV2.identity.userProfile.resetPassword<UserProfileResetPasswordParameters, any>,
        verifyEmail: SpaceConnector.clientV2.identity.userProfile.verifyEmail<UserProfileVerifyEmailParameters, any>,
        confirmEmail: SpaceConnector.clientV2.identity.userProfile.confirmEmail<UserProfileConfirmEmailParameters, UserModel>,
        disableMfa: SpaceConnector.clientV2.identity.userProfile.disableMfa<UserProfileDisableMfaParameters, UserModel>,
        enableMfa: SpaceConnector.clientV2.identity.userProfile.enableMfa<UserProfileEnableMfaParameters, UserModel>,
        confirmMfa: SpaceConnector.clientV2.identity.userProfile.confirmMfa<UserProfileConfirmMfaParameters, UserModel>,
        getWorkspaces: SpaceConnector.clientV2.identity.userProfile.getWorkspaces<UserProfileGetWorkspacesParameters, any>,
    };

    return {
        userProfileAPI: actions,
    };
};
