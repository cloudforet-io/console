<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PDefinitionTable, PHeading, PI, PStatus,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';

import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import config from '@/lib/config';

import {
    calculateTime,
    useRoleFormatter,
    userStateFormatter,
} from '@/services/administration/composables/refined-table-data';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const route = useRoute();

const appContextStore = useAppContextStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const storeState = reactive({
    userInfo: computed(() => store.state.user),
    timezone: computed(() => storeState.userInfo.timezone || 'UTC'),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    refinedUserItems: computed(() => ({
        ...state.selectedUser,
        last_accessed_at: calculateTime(state.selectedUser.last_accessed_at, state.selectedUser.timezone),
    })),
    fields: computed<DefinitionField[]>(() => {
        const additionalFields: DefinitionField[] = [];
        const additionalRoleFields: DefinitionField[] = [];
        if (storeState.smtpEnabled) {
            additionalFields.push({
                name: 'email',
                label: i18n.t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL'),
            });
        }
        if (storeState.userInfo.roleType === ROLE_TYPE.WORKSPACE_MEMBER) {
            additionalRoleFields.push({
                name: 'role_binding_info',
                label: i18n.t('IDENTITY.USER.MAIN.WORKSPACE_ROLE'),
            });
        }
        return [
            { name: 'user_id', label: i18n.t('IDENTITY.USER.MAIN.USER_ID') },
            { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.NAME') },
            { name: 'state', label: i18n.t('IDENTITY.USER.MAIN.STATE') },
            ...additionalFields,
            { name: 'mfa', label: i18n.t('IDENTITY.USER.MAIN.MFA'), disableCopy: true },
            { name: 'last_accessed_at', label: i18n.t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
            { name: 'domain_id', label: i18n.t('IDENTITY.USER.MAIN.DOMAIN_ID') },
            { name: 'role_type', label: i18n.t('IDENTITY.USER.MAIN.ROLE') },
            ...additionalRoleFields,
            { name: 'language', label: i18n.t('IDENTITY.USER.MAIN.LANGUAGE') },
            { name: 'timezone', label: i18n.t('IDENTITY.USER.MAIN.TIMEZONE') },
            { name: 'created_at', label: i18n.t('IDENTITY.USER.MAIN.CREATED_AT') },
        ];
    }),
});

/* API */
const getUserDetailData = async (userId) => {
    if (storeState.isAdminMode) {
        await userPageStore.getUser({ user_id: userId || state.selectedUser.user_id });
    } else {
        await userPageStore.getWorkspaceUser({
            user_id: userId || state.selectedUser.user_id,
            workspace_id: route.params?.workspaceId || '',
        });
    }
};

/* Watcher */
watch(() => state.selectedUser.user_id, (value) => {
    getUserDetailData(value);
}, { immediate: true });
</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')"
        />
        <p-definition-table :fields="tableState.fields"
                            :data="tableState.refinedUserItems"
                            :loading="userPageState.loading.detail"
                            :skeleton-rows="7"
                            class="user-definition-table"
                            v-on="$listeners"
        >
            <template #data-state="{data}">
                <p-status v-bind="userStateFormatter(data)"
                          class="capitalize"
                />
            </template>
            <template #data-mfa="{data}">
                {{ data?.state === 'ENABLED' ? 'On' : 'Off' }}
            </template>
            <template #data-role_type="{value}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ useRoleFormatter(value).name }}</span>
                </span>
            </template>
            <template #data-role_binding_info="{value}">
                {{ value.role_type }}
            </template>
            <template #data-email="{data}">
                <span class="notification-email-wrapper">
                    <span class="notification-email"
                          :class="tableState.refinedUserItems.email_verified && 'verified-text'"
                    >
                        {{ data }}
                    </span>
                </span>
            </template>
            <template #data-last_accessed_at="{data}">
                <span v-if="data === -1">
                    No Activity
                </span>
                <span v-else-if="data === 0">
                    {{ $t('IDENTITY.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="data === 1">
                    {{ $t('IDENTITY.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ data }} {{ $t('IDENTITY.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #data-created_at="{data}">
                {{ iso8601Formatter(data, storeState.timezone) }}
            </template>
            <template #extra="{label}">
                <span v-if="storeState.isAdminMode && tableState.refinedUserItems.email && label === $t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL')">
                    <span v-if="tableState.refinedUserItems.email_verified">
                        <p-i name="ic_verified"
                             height="1rem"
                             width="1rem"
                             class="verified-icon"
                             color="#60B731"
                        />
                    </span>
                    <span v-else
                          class="not-verified"
                    >
                        {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.NOT_VERIFIED') }}
                    </span>
                </span>
            </template>
        </p-definition-table>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-definition */
:deep(.p-definition) {
    height: 2.25rem;
    .value-wrapper {
        padding: 0 1rem;
        .p-copy-button {
            @apply flex items-center;
            gap: 0.25rem;
            .copy-text {
                margin: 0;
            }
        }
    }
}
.user-definition-table {
    .notification-email-wrapper {
        @apply flex items-center;
        .notification-email {
            @apply flex items-center;
        }
    }
    .not-verified {
        @apply bg-yellow-200 text-label-sm;
        height: 1.25rem;
        padding: 0.15rem 0.5rem;
        border-radius: 6.25rem;
    }
    .verified-icon {
        @apply absolute;
        bottom: -0.1rem;
        left: 0;
    }
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
    }
}
</style>
