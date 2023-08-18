<script setup lang="ts">
import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDefinitionTable, PHeading, PI, PStatus,
} from '@spaceone/design-system';
import {
    computed, reactive, useAttrs, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';
import VerifyButton from '@/common/modules/button/verify-button/VerifyButton.vue';

import { calculateTime, userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import type { UserDetailData } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    userId: string
    timezone: string
}

const props = withDefaults(defineProps<Props>(), {
    userId: '',
    timezone: '',
});
const { t } = useI18n();
const attrs = useAttrs();

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    loading: true,
    fields: computed(() => [
        { name: 'user_id', label: t('IDENTITY.USER.MAIN.USER_ID') },
        { name: 'name', label: t('IDENTITY.USER.MAIN.NAME') },
        { name: 'state', label: t('IDENTITY.USER.MAIN.STATE') },
        { name: 'user_type', label: t('IDENTITY.USER.MAIN.ACCESS_CONTROL') },
        {
            name: 'email',
            label: t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL'),
            block: true,
            disableCopy: state.data.user_type === 'API_USER',
        },
        { name: 'last_accessed_at', label: t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
        { name: 'domain_id', label: t('IDENTITY.USER.MAIN.DOMAIN_ID') },
        { name: 'language', label: t('IDENTITY.USER.MAIN.LANGUAGE') },
        { name: 'timezone', label: t('IDENTITY.USER.MAIN.TIMEZONE') },
        { name: 'created_at', label: t('IDENTITY.USER.MAIN.CREATED_AT') },
    ]),
    data: {} as UserDetailData,
});

/* API */
const getUserDetailData = async (userId) => {
    state.loading = true;
    try {
        const response = await SpaceConnector.client.identity.user.get({
            user_id: userId || props.userId,
        });
        state.data = response;
        state.data.last_accessed_at = calculateTime(state.data.last_accessed_at, props.timezone as string) || 0;
        state.data.email = response.email;
        state.data.email_verified = response.email_verified;
        state.loading = false;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const listeners = { ...attrs };

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
                   :title="t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')"
        />
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :loading="state.loading"
                            :skeleton-rows="7"
                            v-on="listeners"
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
                        {{ t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.NOT_VERIFIED') }}
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
                    {{ t('IDENTITY.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="data === 1">
                    {{ t('IDENTITY.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ data }} {{ t('IDENTITY.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #data-created_at="{data}">
                {{ iso8601Formatter(data, timezone) }}
            </template>
            <template #extra="{label}">
                <verify-button
                    v-if="label === t('IDENTITY.USER.MAIN.NOTIFICATION_EMAIL') && state.data.user_type !== 'API_USER'"
                    :email="state.data.email"
                    :user-id="state.data.user_id"
                    :domain-id="state.data.domain_id"
                    :verified="state.data.email_verified"
                    is-administration
                    @refresh-user="getUserDetailData"
                />
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
