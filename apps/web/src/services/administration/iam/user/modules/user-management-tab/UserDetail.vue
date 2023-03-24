<template>
    <div>
        <p-heading heading-type="sub"
                   :title="title"
        />
        <p-definition-table :fields="fields"
                            :data="data"
                            :loading="loading"
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
        </p-definition-table>
    </div>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PHeading, PDefinitionTable, PStatus } from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { Tags } from '@/models';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { calculateTime, userStateFormatter } from '@/services/administration/iam/user/lib/helper';
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

export default {
    name: 'UserDetail',
    components: {
        PStatus,
        PDefinitionTable,
        PHeading,
    },
    props: {
        userId: {
            type: String,
            required: true,
        },
        timezone: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const baseState = reactive({
            title: computed(() => vm.$t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')),
            loading: true,
            fields: computed(() => [
                { name: 'user_id', label: i18n.t('IDENTITY.USER.MAIN.USER_ID') },
                { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.NAME') },
                { name: 'state', label: i18n.t('IDENTITY.USER.MAIN.STATE') },
                { name: 'user_type', label: i18n.t('IDENTITY.USER.MAIN.ACCESS_CONTROL') },
                { name: 'email', label: i18n.t('IDENTITY.USER.MAIN.EMAIL') },
                { name: 'last_accessed_at', label: i18n.t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
                { name: 'domain_id', label: i18n.t('IDENTITY.USER.MAIN.DOMAIN_ID') },
                { name: 'language', label: i18n.t('IDENTITY.USER.MAIN.LANGUAGE') },
                { name: 'timezone', label: i18n.t('IDENTITY.USER.MAIN.TIMEZONE') },
                { name: 'created_at', label: i18n.t('IDENTITY.USER.MAIN.CREATED_AT') },
            ]),
            data: {} as UserDetailData,
        });

        const getUserDetailData = async (userId) => {
            baseState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.get({
                    user_id: userId,
                });
                baseState.data = res;
                // eslint-disable-next-line camelcase
                baseState.data.last_accessed_at = calculateTime(baseState.data.last_accessed_at, props.timezone as string) || 0;
                baseState.loading = false;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        watch(() => props.userId, () => {
            const userId = props.userId;
            getUserDetailData(userId);
        }, { immediate: true });

        return {
            ...toRefs(baseState),
            userStateFormatter,
            iso8601Formatter,
        };
    },
};
</script>
