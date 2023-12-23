<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PButton,
    PDefinitionTable, PHeading, PI, PStatus,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';

import { iso8601Formatter } from '@cloudforet/utils';

import { store } from '@/store';
import { i18n } from '@/translations';

import config from '@/lib/config';
import { postValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    calculateTime,
    useRoleFormatter,
    userStateFormatter,
} from '@/services/administration/composables/refined-table-data';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();

const emit = defineEmits<{(e: 'refresh', id: string): void }>();

const storeState = reactive({
    userInfo: computed(() => store.state.user),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
});
const state = reactive({
    loading: false,
    verifyEmailLoading: false,
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
        if (userPageStore.isAdminMode) {
            if (!storeState.smtpEnabled) {
                additionalFields.push(
                    { name: 'email', label: i18n.t('IAM.USER.MAIN.NOTIFICATION_EMAIL'), block: true },
                );
            }
            additionalFields.push(
                { name: 'mfa', label: i18n.t('IAM.USER.MAIN.MFA'), disableCopy: true },
            );
        } else {
            additionalRoleFields.push({
                name: 'role_binding',
                label: i18n.t('IAM.USER.MAIN.ROLE'),
            });
        }

        return [
            { name: 'user_id', label: i18n.t('IAM.USER.MAIN.USER_ID') },
            { name: 'name', label: i18n.t('IAM.USER.MAIN.NAME') },
            { name: 'state', label: i18n.t('IAM.USER.MAIN.STATE') },
            ...additionalFields,
            { name: 'last_accessed_at', label: i18n.t('IAM.USER.MAIN.LAST_ACTIVITY') },
            { name: 'domain_id', label: i18n.t('IAM.USER.MAIN.DOMAIN_ID') },
            { name: 'role_type', label: i18n.t('IAM.USER.MAIN.ROLE_TYPE') },
            ...additionalRoleFields,
            { name: 'language', label: i18n.t('IAM.USER.MAIN.LANGUAGE') },
            { name: 'timezone', label: i18n.t('IAM.USER.MAIN.TIMEZONE') },
            { name: 'created_at', label: i18n.t('IAM.USER.MAIN.CREATED_AT') },
        ];
    }),
});

/* API */
const handleClickVerifyButton = async () => {
    state.verifyEmailLoading = true;
    try {
        if (tableState.refinedUserItems.email_verified) return;
        await postValidationEmail({
            email: tableState.refinedUserItems.email || '',
        });
        await emit('refresh', tableState.refinedUserItems.user_id || '');
        await store.dispatch('user/setUser', { email: tableState.refinedUserItems.email });
    } catch (e: any) {
        ErrorHandler.handleError(e);
    } finally {
        state.verifyEmailLoading = false;
    }
};
</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="$t('IAM.USER.MAIN.BASE_INFORMATION')"
        />
        <p-definition-table :fields="tableState.fields"
                            :data="tableState.refinedUserItems"
                            :loading="state.loading"
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
            <template #data-role_binding="{value}">
                {{ value.name }}
            </template>
            <template #data-last_accessed_at="{data}">
                <span v-if="data === -1">
                    No Activity
                </span>
                <span v-else-if="data === 0">
                    {{ $t('IAM.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="data === 1">
                    {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ data }} {{ $t('IAM.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #data-created_at="{data}">
                {{ iso8601Formatter(data, userPageStore.timezone) }}
            </template>
            <template #data-email="{data}">
                <div v-if="data && data !== ''"
                     class="col-email"
                >
                    <span :class="tableState.refinedUserItems.email_verified && 'verified-text'">{{ data }}</span>
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
                        {{ $t('IAM.USER.MAIN.NOT_VERIFIED') }}
                    </span>
                </div>
            </template>
            <template #extra="{label}">
                <p-button v-if="label === $t('IAM.USER.MAIN.NOTIFICATION_EMAIL')
                              && !tableState.refinedUserItems.email_verified
                              && tableState.refinedUserItems.email
                              && tableState.refinedUserItems.email !== ''"
                          style-type="primary"
                          size="sm"
                          :loading="state.verifyEmailLoading"
                          class="toolbox-button send-mail-button"
                          @click="handleClickVerifyButton"
                >
                    <span>{{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.VERIFY') }}</span>
                </p-button>
            </template>
        </p-definition-table>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-definition */
:deep(.p-definition) {
    height: 2.25rem;
    .value-wrapper {
        @apply items-center;
        padding: 0 1rem;
        .extra {
            @apply flex items-center;
            max-height: 100%;
            .verify-button-wrapper {
                height: 1.5rem;
            }
        }
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
    .col-email {
        @apply relative;
        .not-verified {
            @apply absolute bg-yellow-200 text-label-sm;
            width: 5.375rem;
            height: 1.25rem;
            padding: 0.15rem 0.5rem;
            border-radius: 6.25rem;
            right: -7rem;
        }
        .verified-text {
            margin-left: 1.5rem;
        }
        .verified-icon {
            @apply absolute;
            bottom: -0.025rem;
            left: 0;
        }
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
