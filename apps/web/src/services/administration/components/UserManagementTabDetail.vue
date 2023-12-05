<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PDefinitionTable, PHeading, PI, PStatus,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { iso8601Formatter } from '@cloudforet/utils';

import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import config from '@/lib/config';
import { postValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import VerifyButton from '@/common/modules/button/verify-button/VerifyButton.vue';
import NotificationEmailModal from '@/common/modules/modals/notification-email-modal/NotificationEmailModal.vue';

import { calculateTime, userStateFormatter } from '@/services/administration/composables/refined-user-data';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { User } from '@/services/administration/types/user-type';

interface Props {
    userId: string
    timezone: string
}

const props = withDefaults(defineProps<Props>(), {
    userId: '',
    timezone: '',
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    loading: true,
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    fields: computed<DefinitionField[]>(() => {
        const additionalFields: DefinitionField[] = [];
        if (state.smtpEnabled) {
            additionalFields.push({
                name: 'email',
                label: i18n.t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL'),
                block: true,
                disableCopy: state.data.user_type === 'API_USER',
            });
        }
        return [
            { name: 'user_id', label: i18n.t('IDENTITY.USER.MAIN.USER_ID') },
            { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.NAME') },
            { name: 'state', label: i18n.t('IDENTITY.USER.MAIN.STATE') },
            { name: 'user_type', label: i18n.t('IDENTITY.USER.MAIN.ACCESS_CONTROL') },
            ...additionalFields,
            { name: 'mfa', label: i18n.t('IDENTITY.USER.MAIN.MFA'), disableCopy: true },
            { name: 'last_accessed_at', label: i18n.t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
            { name: 'domain_id', label: i18n.t('IDENTITY.USER.MAIN.DOMAIN_ID') },
            { name: 'role_type', label: i18n.t('IDENTITY.USER.MAIN.WORKSPACE_ROLE_TYPE') },
            { name: 'role_id', label: i18n.t('IDENTITY.USER.MAIN.WORKSPACE_ROLE') },
            { name: 'language', label: i18n.t('IDENTITY.USER.MAIN.LANGUAGE') },
            { name: 'timezone', label: i18n.t('IDENTITY.USER.MAIN.TIMEZONE') },
            { name: 'created_at', label: i18n.t('IDENTITY.USER.MAIN.CREATED_AT') },
        ];
    }),
    data: {} as User,
    verifyEmailLoading: false,
    isModalVisible: false,
    modalType: '',
});

/* API */
const getUserDetailData = async (userId) => {
    state.loading = true;
    try {
        const response = await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>({
            user_id: userId || props.userId,
        });
        state.data = {
            ...response,
            last_accessed_at: calculateTime(state.data.last_accessed_at, props.timezone as string) || 0,
        };
    } catch (e) {
        state.data = {} as UserModel;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const handleClickVerifyButton = async (type: string) => {
    state.verifyEmailLoading = true;
    try {
        if (state.data.email_verified) return;
        await postValidationEmail({
            user_id: state.data.user_id,
            domain_id: state.data.domain_id,
            email: state.data.email,
        });
        await store.dispatch('user/setUser', { email: state.data.email });
    } catch (e: any) {
        ErrorHandler.handleError(e);
    } finally {
        state.isModalVisible = true;
        state.verifyEmailLoading = false;
        state.modalType = type;
    }
};

/* Watcher */
watch(() => props.userId, (value) => {
    getUserDetailData(value);
}, { immediate: true });
watch(() => userPageState.visibleUpdateModal, (value) => {
    if (!value) {
        getUserDetailData(props.userId);
    }
});
</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')"
        />
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :loading="state.loading"
                            :skeleton-rows="7"
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
            <template #data-user_type="{data}">
                <span v-if="data === 'API_USER'">API Only</span>
                <span v-else>Console, API</span>
            </template>
            <template #data-email="{data}">
                <span v-if="state.data.user_type !== 'API_USER'">
                    <span :class="state.data.email_verified && 'verified-text'">{{ data }}</span>
                    <span v-if="state.data.email_verified">
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
                <span v-else>
                    <span>N/A</span>
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
                {{ iso8601Formatter(data, timezone) }}
            </template>
            <template #extra="{label}">
                <verify-button
                    v-if="label === $t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL') && state.data.user_type !== 'API_USER'"
                    :loading="state.verifyEmailLoading"
                    :email="state.data.email"
                    :verified="state.data.email_verified"
                    is-administration
                    @click-button="handleClickVerifyButton"
                >
                    <notification-email-modal
                        :domain-id="state.data.domain_id"
                        :user-id="state.data.user_id"
                        :email="state.data.email"
                        :modal-type="state.modalType"
                        :visible.sync="state.isModalVisible"
                        @refresh-user="getUserDetailData"
                    />
                </verify-button>
            </template>
        </p-definition-table>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-definition */
:deep(.p-definition) {
    .value-wrapper {
        @apply relative;
        .copy-text {
            @apply relative;
            .not-verified {
                @apply absolute bg-yellow-200 text-label-sm;
                right: -7rem;
                padding: 0.15rem 0.5rem;
                border-radius: 6.25rem;
            }
            .verified-text {
                padding-left: 1.25rem;
            }
            .verified-icon {
                @apply absolute;
                bottom: -0.1rem;
                left: 0;
            }
        }
    }
    &.block {
        .extra {
            height: 1.5rem;
            margin-top: -0.125rem;
            margin-left: 0;
            .verify-button-wrapper {
                @apply flex justify-end;
            }
        }
    }
}
</style>
