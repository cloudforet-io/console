<template>
    <div>
        <p-panel-top>{{ title }}</p-panel-top>
        <p-definition-table :fields="fields" :data="data" :loading="loading"
                            :skeleton-rows="7" v-on="$listeners"
        >
            <template #data-state="{data}">
                <p-status v-bind="userStateFormatter(data)" class="capitalize" />
            </template>
            <template #data-user_type="{value}">
                <span v-if="value === 'API_USER'">API Only</span>
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
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PPanelTop, PDefinitionTable, PStatus } from '@spaceone/design-system';

import { calculateTime, userStateFormatter } from '@/views/identity/user/lib/helper';
import { SpaceConnector } from '@/lib/space-connector';

import { Tags } from '@/models';
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
    email: string;
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
        PPanelTop,
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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const baseState = reactive({
            title: computed(() => vm.$t('IDENTITY.USER.MAIN.BASE_INFORMATION')),
            loading: true,
            fields: computed(() => [
                { name: 'user_id', label: vm.$t('IDENTITY.USER.MAIN.USER_ID') },
                { name: 'name', label: vm.$t('IDENTITY.USER.MAIN.NAME') },
                { name: 'state', label: vm.$t('IDENTITY.USER.MAIN.STATE') },
                { name: 'user_type', label: vm.$t('IDENTITY.USER.MAIN.ACCESS_CONTROL') },
                { name: 'email', label: vm.$t('IDENTITY.USER.MAIN.EMAIL') },
                { name: 'last_accessed_at', label: vm.$t('IDENTITY.USER.MAIN.LAST_ACTIVITY') },
                { name: 'domain_id', label: vm.$t('IDENTITY.USER.MAIN.DOMAIN_ID') },
                { name: 'language', label: vm.$t('IDENTITY.USER.MAIN.LANGUAGE') },
                { name: 'timezone', label: vm.$t('IDENTITY.USER.MAIN.TIMEZONE') },
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
                console.error(e);
            }
        };

        watch(() => props.userId, () => {
            const userId = props.userId;
            getUserDetailData(userId);
        }, { immediate: true });

        return {
            ...toRefs(baseState),
            userStateFormatter,
        };
    },
};
</script>
