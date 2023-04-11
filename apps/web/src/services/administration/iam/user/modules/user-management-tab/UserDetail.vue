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
                    :email="state.data.email"
                    :user-id="state.data.user_id"
                    :domain-id="state.data.domain_id"
                    :verified="state.data.email_verified"
                    is-administration
                    @handle-user-detail="getUserDetailPartialData"
                />
            </template>
        </p-definition-table>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PDefinitionTable, PHeading, PI, PStatus,
} from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import VerifyButton from '@/common/modules/button/verify-button/VerifyButton.vue';

import { calculateTime, userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import type { UserDetailData } from '@/services/administration/iam/user/type';

interface Props {
    userId: string
    timezone: string
}

const props = withDefaults(defineProps<Props>(), {
    userId: '',
    timezone: '',
});

const state = reactive({
    loading: true,
    fields: computed(() => [
        { name: 'user_id', label: i18n.t('IDENTITY.USER.MAIN.USER_ID') },
        { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.NAME') },
        { name: 'state', label: i18n.t('IDENTITY.USER.MAIN.STATE') },
        { name: 'user_type', label: i18n.t('IDENTITY.USER.MAIN.ACCESS_CONTROL') },
        {
            name: 'email', label: i18n.t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL'), block: true, disableCopy: state.data.user_type === 'API_USER',
        },
        { name: 'last_accessed_at', label: i18n.t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
        { name: 'domain_id', label: i18n.t('IDENTITY.USER.MAIN.DOMAIN_ID') },
        { name: 'language', label: i18n.t('IDENTITY.USER.MAIN.LANGUAGE') },
        { name: 'timezone', label: i18n.t('IDENTITY.USER.MAIN.TIMEZONE') },
        { name: 'created_at', label: i18n.t('IDENTITY.USER.MAIN.CREATED_AT') },
    ]),
    data: {} as UserDetailData,
});

/* API */
const getUserDetailData = async (userId) => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.client.identity.user.get({
            user_id: userId || props.userId,
        });
        // eslint-disable-next-line camelcase
        state.data.last_accessed_at = calculateTime(state.data.last_accessed_at, props.timezone as string) || 0;
        state.loading = false;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const getUserDetailPartialData = async () => {
    state.loading = true;
    try {
        const response = await SpaceConnector.client.identity.user.get({
            user_id: props.userId,
        });
        state.data.email = response.email;
        state.data.email_verified = response.email_verified;
        state.loading = false;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Watcher */
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
                bottom: -0.1rem;
                left: 0;
            }
        }
    }
    &.block {
        .extra {
            width: 3.75rem;
            height: 1.5rem;
            margin-top: -0.125rem;
            margin-left: 0;
        }
    }
}
</style>
