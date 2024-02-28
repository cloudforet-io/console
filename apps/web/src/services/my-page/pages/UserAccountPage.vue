<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading, PI, PPaneLayout } from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import config from '@/lib/config';

import UserAccountBaseInformation from '@/services/my-page/components/UserAccountBaseInformation.vue';
import UserAccountChangePassword from '@/services/my-page/components/UserAccountChangePassword.vue';
import UserAccountMultiFactorAuth from '@/services/my-page/components/UserAccountMultiFactorAuth.vue';
import UserAccountNotificationEmail from '@/services/my-page/components/UserAccountNotificationEmail.vue';

const storeState = reactive({
    authType: computed(() => store.state.user.authType),
    baseRoleType: computed(() => store.state.user.roleType),
    currentRoleType: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType),
    userId: computed(() => store.state.user.userId),
});
const state = reactive({
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    icon: computed<string>(() => {
        if (store.getters['user/isSystemAdmin']) return 'img_avatar_system-admin';
        if (store.getters['user/isDomainAdmin']) return 'img_avatar_admin';
        const currentRoleType = storeState.currentRoleType;
        if (currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) return 'img_avatar_workspace-owner';
        if (currentRoleType === ROLE_TYPE.WORKSPACE_MEMBER) return 'img_avatar_workspace-member';
        return 'img_avatar_no-role';
    }),
    roleType: computed(() => {
        if (storeState.baseRoleType === ROLE_TYPE.DOMAIN_ADMIN) return 'Admin';
        if (storeState.currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) return 'Workspace Owner';
        if (storeState.currentRoleType === ROLE_TYPE.WORKSPACE_MEMBER) return 'Workspace Member';
        return 'User';
    }),
});
</script>

<template>
    <section class="user-account-page">
        <p-heading :title="$t('MY_PAGE.ACCOUNT.ACCOUNT_N_PROFILE')" />
        <div class="contents-wrapper">
            <p-pane-layout class="role-card-content">
                <p-i :name="state.icon"
                     class="user-icon"
                     width="4rem"
                     height="4rem"
                />
                <span class="role-type-name">
                    {{ state.roleType }}
                </span>
                <span class="role-type-description">
                    {{ storeState.userId }}
                </span>
            </p-pane-layout>
            <div class="user-account-wrapper">
                <user-account-base-information />
                <user-account-notification-email v-if="state.smtpEnabled && (storeState.authType === 'LOCAL' || storeState.authType === 'EXTERNAL')" />
                <user-account-multi-factor-auth />
                <user-account-change-password v-if="storeState.authType === 'LOCAL'" />
            </div>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.user-account-page {
    @apply flex flex-col;
    gap: 1.5rem;
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

            @screen mobile {
                @apply hidden;
            }
        }
        .user-account-wrapper {
            flex: 1;
        }
    }
}
</style>
