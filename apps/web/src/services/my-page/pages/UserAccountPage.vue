<script setup lang="ts">
import {
    computed, onMounted, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import {
    PHeadingLayout, PPaneLayout, PLazyImg, PAvatar, PButton, PHeading, PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { TokenIssueParameters } from '@/api-clients/identity/token/schema/api-verbs/issue';
import type { TokenIssueModel } from '@/api-clients/identity/token/schema/model';
import type { AuthType } from '@/api-clients/identity/user/schema/type';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import UserAccountBaseInformation from '@/services/my-page/components/UserAccountBaseInformation.vue';
import UserAccountChangePassword from '@/services/my-page/components/UserAccountChangePassword.vue';
import UserAccountMultiFactorAuth from '@/services/my-page/components/UserAccountMultiFactorAuth.vue';
import UserAccountNotificationEmail from '@/services/my-page/components/UserAccountNotificationEmail.vue';

const PASSWORD_MIN_LENGTH = 8;

const domainStore = useDomainStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const storeState = reactive({
    authType: computed<AuthType|undefined>(() => userStore.state.authType),
    baseRoleType: computed<RoleType|undefined>(() => userStore.state.roleType),
    currentRoleType: computed(() => authorizationStore.state.currentRoleInfo?.roleType),
    userId: computed<string|undefined>(() => userStore.state.userId),
});
const state = reactive({
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    icon: computed<string>(() => {
        if (userStore.getters.isSystemAdmin) return SystemAdminImage;
        if (userStore.getters.isDomainAdmin) return DomainAdminImage;
        const currentRoleType = storeState.currentRoleType;
        if (currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) return WorkspaceOwnerImage;
        if (currentRoleType === ROLE_TYPE.WORKSPACE_MEMBER) return WorkspaceMemberImage;
        return UserImage;
    }),
    roleType: computed(() => {
        if (storeState.baseRoleType === ROLE_TYPE.DOMAIN_ADMIN) return 'Admin';
        if (storeState.currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) return 'Workspace Owner';
        if (storeState.currentRoleType === ROLE_TYPE.WORKSPACE_MEMBER) return 'Workspace Member';
        return 'User';
    }),
    readonlyMode: computed(() => {
        const isLocalUser = storeState.authType === 'LOCAL';
        return isLocalUser ? !passwordFormState.isTokenChecked : false;
    }),
});

const passwordFormState = reactive({
    passwordCheckModalVisible: false,
    password: '',
    certifiedPassword: '',
    loading: false,
    userId: computed<string|undefined>(() => userStore.state.userId),
    isTokenChecked: undefined as boolean|undefined,
    invalidText: '' as string|TranslateResult,
});

const passwordCheckFecher = getCancellableFetcher(SpaceConnector.clientV2.identity.token.issue);

const handleConfirmPasswordCheckModal = async () => {
    if (passwordFormState.password.length < PASSWORD_MIN_LENGTH) return;
    passwordFormState.loading = true;
    try {
        const result = await passwordCheckFecher<TokenIssueParameters, TokenIssueModel>({
            domain_id: domainStore.state.domainId,
            auth_type: 'LOCAL',
            credentials: {
                user_id: passwordFormState.userId,
                password: passwordFormState.password,
            },
        }, { skipAuthRefresh: true });
        if (result.status === 'succeed') {
            if (!!result.response.access_token && !!result.response.refresh_token) {
                passwordFormState.certifiedPassword = passwordFormState.password;
                passwordFormState.isTokenChecked = true;
                passwordFormState.invalidText = '';
                passwordFormState.passwordCheckModalVisible = false;
                showSuccessMessage(i18n.t('COMMON.PROFILE.SUCCESS_PASSWORD_CHECK'), '');
            } else {
                passwordFormState.isTokenChecked = false;
                passwordFormState.invalidText = i18n.t('COMMON.PROFILE.CURRENT_PASSWORD_INVALID');
            }
        }
    } catch (e: any) {
        if (e.message.startsWith(' MFA is required.')) { // MFA activated CASE
            passwordFormState.certifiedPassword = passwordFormState.password;
            passwordFormState.isTokenChecked = true;
            passwordFormState.invalidText = '';
            passwordFormState.passwordCheckModalVisible = false;
            showSuccessMessage(i18n.t('COMMON.PROFILE.SUCCESS_PASSWORD_CHECK'), '');
        } else {
            passwordFormState.isTokenChecked = false;
            passwordFormState.invalidText = i18n.t('COMMON.PROFILE.CURRENT_PASSWORD_INVALID');
        }
    } finally {
        passwordFormState.loading = false;
    }
};
const handleOpenPasswordCheckModal = () => {
    passwordFormState.passwordCheckModalVisible = true;
};
const handleClickCancel = () => {
    passwordFormState.passwordCheckModalVisible = false;
    passwordFormState.password = '';
    passwordFormState.certifiedPassword = '';
    passwordFormState.isTokenChecked = undefined;
    passwordFormState.invalidText = '';
};

// TODO: remove this after tanstack query is implemented
onMounted(async () => {
    await userStore.getUserInfo();
});

</script>

<template>
    <section class="user-account-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('MY_PAGE.ACCOUNT.ACCOUNT_N_PROFILE')" />
            </template>
            <template #extra>
                <p-button v-if="!passwordFormState.isTokenChecked && storeState.authType === 'LOCAL'"
                          @click="handleOpenPasswordCheckModal"
                >
                    {{ $t('COMMON.PROFILE.EDIT_ACCOUNT_INFO') }}
                </p-button>
            </template>
        </p-heading-layout>
        <div class="contents-wrapper">
            <p-pane-layout class="role-card-content">
                <div class="icon-wrapper">
                    <p-avatar size="xl" />
                    <p-lazy-img v-if="state.roleType === 'Admin'"
                                :src="state.icon"
                                class="user-icon"
                                width="1.5rem"
                                height="1.5rem"
                    />
                </div>
                <span class="role-type-name">
                    {{ state.roleType }}
                </span>
                <span class="role-type-description">
                    {{ storeState.userId }}
                </span>
            </p-pane-layout>
            <div class="user-account-wrapper">
                <user-account-base-information :readonly-mode="state.readonlyMode" />
                <user-account-change-password v-if="storeState.authType === 'LOCAL'"
                                              :readonly-mode="state.readonlyMode"
                                              :certified-password="passwordFormState.certifiedPassword"
                />
                <user-account-notification-email v-if="state.smtpEnabled && (storeState.authType === 'LOCAL' || storeState.authType === 'EXTERNAL')"
                                                 :readonly-mode="state.readonlyMode"
                />
                <user-account-multi-factor-auth :readonly-mode="state.readonlyMode" />
            </div>
        </div>
        <p-button-modal :header-title="$t('COMMON.PROFILE.PASSWORD_CHECK_TITLE')"
                        :visible.sync="passwordFormState.passwordCheckModalVisible"
                        :loading="passwordFormState.loading"
                        :disabled="passwordFormState.password.length < PASSWORD_MIN_LENGTH"
                        size="sm"
                        @confirm="handleConfirmPasswordCheckModal"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div class="modal-content-wrapper">
                    <p-field-group :label="$t('COMMON.PROFILE.CURRENT_PASSWORD')"
                                   required
                                   :invalid="passwordFormState.isTokenChecked === false"
                                   :invalid-text="passwordFormState.invalidText"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="passwordFormState.password"
                                          type="password"
                                          placeholder="Password"
                                          appearance-type="masking"
                                          :invalid="invalid"
                                          block
                                          @keyup.enter="handleConfirmPasswordCheckModal"
                            />
                        </template>
                    </p-field-group>
                </div>
            </template>
        </p-button-modal>
    </section>
</template>

<style lang="postcss" scoped>
.user-account-page {
    @apply flex flex-col;
    .contents-wrapper {
        @apply flex;
        gap: 1rem;
        .role-card-content {
            @apply flex flex-col items-center justify-center text-label-md text-gray-800;
            width: 20.125rem;
            height: 10.625rem;
            gap: 0.5rem;
            .role-type-name {
                @apply font-bold;
            }

            @apply mobile:hidden;
        }
        .user-account-wrapper {
            width: 100%;
            flex: 1;
        }

        .icon-wrapper {
            position: relative;

            & .user-icon {
                bottom: 0;
                right: 0;
                position: absolute;
            }
        }
    }
}
.modal-content-wrapper {
    height: 8.75rem;
}

/* custom design-system component - p-lazy-img */
:deep(.p-lazy-img .img-container) {
    @apply rounded-full;
}
</style>
