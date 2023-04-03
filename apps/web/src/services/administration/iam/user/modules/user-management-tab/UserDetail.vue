<template>
    <div>
        <p-heading heading-type="sub"
                   :title="state.title"
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
            <template #data-user_type="{data}">
                <span v-if="data === 'API_USER'">API Only</span>
                <span v-else>Console, API</span>
            </template>
            <template #data-email="{data}">
                <span :class="state.verified && 'verified-text'">{{ data }}</span>
                <span v-if="state.verified">
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
                <p-button
                    v-if="label === 'Notification E-mail'"
                    size="sm"
                    :style-type="state.verified ? 'tertiary' : 'primary'"
                    @click="handleClickVerifiedEmail"
                >
                    {{
                        state.verified
                            ? $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE')
                            : $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY')
                    }}
                </p-button>
            </template>1234
        </p-definition-table>
        <notification-email-modal />
    </div>
</template>

<script setup lang="ts">
import {
    computed, getCurrentInstance, reactive, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PButton, PDefinitionTable, PHeading, PI, PStatus,
} from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { Tags } from '@/models';
import { i18n } from '@/translations';

import NotificationEmailModal from '@/common/components/modals/NotificationEmailModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { calculateTime, userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import { useMyAccountPageStore } from '@/services/my-page/store/my-account-page-store';

// const arrayFormatter = value => ((value && Array.isArray(value) && value.length > 0) ? value.join(', ') : '');

interface Timestamp {
    seconds: string;
    nanos?: number;
}
interface UserDetailData {
    roles?: unknown;
    tags?: Tags;
    user_id: string;
    name: string;
    state: string;
    email?: string;
    // eslint-disable-next-line camelcase
    user_type: string;
    backend: string;
    language: string;
    timezone: string;
    // eslint-disable-next-line camelcase
    last_accessed_at: number;
    created_at?: Timestamp;
    domain_id: string;
}
interface Props {
    userId: string
    timezone: string
}

const myAccountPageStore = useMyAccountPageStore();
const vm = getCurrentInstance()?.proxy as Vue;
const props = withDefaults(defineProps<Props>(), {
    userId: '',
    timezone: '',
});
const state = reactive({
    title: computed(() => vm.$t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')),
    loading: true,
    fields: computed(() => [
        { name: 'user_id', label: i18n.t('IDENTITY.USER.MAIN.USER_ID') },
        { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.NAME') },
        { name: 'state', label: i18n.t('IDENTITY.USER.MAIN.STATE') },
        { name: 'user_type', label: i18n.t('IDENTITY.USER.MAIN.ACCESS_CONTROL') },
        { name: 'email', label: i18n.t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL'), block: true },
        { name: 'last_accessed_at', label: i18n.t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
        { name: 'domain_id', label: i18n.t('IDENTITY.USER.MAIN.DOMAIN_ID') },
        { name: 'language', label: i18n.t('IDENTITY.USER.MAIN.LANGUAGE') },
        { name: 'timezone', label: i18n.t('IDENTITY.USER.MAIN.TIMEZONE') },
        { name: 'created_at', label: i18n.t('IDENTITY.USER.MAIN.CREATED_AT') },
    ]),
    data: {} as UserDetailData,
    verified: true,
    modalVisible: false,
});
const formState = reactive({
    notificationEmail: props.userId,
});

const getUserDetailData = async (userId) => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.client.identity.user.get({
            user_id: userId,
        });
        // eslint-disable-next-line camelcase
        state.data.last_accessed_at = calculateTime(state.data.last_accessed_at, props.timezone as string) || 0;
        state.loading = false;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleClickVerifiedEmail = async () => {
    await myAccountPageStore.postValidationEmail(props.userId, formState.notificationEmail);
};

watch(() => props.userId, () => {
    const userId = props.userId;
    getUserDetailData(userId);
}, { immediate: true });
</script>

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
                top: 0.15rem;
                left: 0;
            }
        }
        .verify-button {
            @apply absolute;
            top: -0.15rem;
            right: -100%;
        }
    }
    &.block {
        .extra {
            height: 1.5rem;
            margin-top: -0.125rem;
        }
    }
}
</style>
