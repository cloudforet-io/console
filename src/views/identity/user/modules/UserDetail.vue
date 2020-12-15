<template>
    <div>
        <p-panel-top>{{ title }}</p-panel-top>
        <p-definition-table :fields="fields" :data="data" :loading="loading"
                            :skeleton-rows="7" v-on="$listeners"
        >
            <template #data-state="{data}">
                <p-status v-bind="userStateFormatter(data)" class="capitalize" />
            </template>
            <template #data-last_accessed_at="{data}">
                {{ timestampFormatter(data, timezone) }}
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { timestampFormatter } from '@/lib/util';
import { userStateFormatter } from '@/views/identity/user/lib/helper';
import { SpaceConnector } from '@/lib/space-connector';

import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { store } from '@/store';
// const arrayFormatter = value => ((value && Array.isArray(value) && value.length > 0) ? value.join(', ') : '');

export default {
    name: 'PUserDetail',
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
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const baseState = reactive({
            timezone: computed(() => store.state.user.timezone),
            title: computed(() => vm.$t('IDENTITY.USER.BASE_INFORMATION')),
            loading: true,
            fields: computed(() => [
                { name: 'user_id', label: vm.$t('IDENTITY.USER.USER_ID') },
                { name: 'name', label: vm.$t('IDENTITY.USER.NAME') },
                { name: 'state', label: vm.$t('IDENTITY.USER.STATE') },
                { name: 'email', label: vm.$t('IDENTITY.USER.EMAIL') },
                { name: 'last_accessed_at', label: vm.$t('IDENTITY.USER.LAST_ACTIVITY') },
                { name: 'domain_id', label: vm.$t('IDENTITY.USER.DOMAIN_ID') },
                { name: 'language', label: vm.$t('IDENTITY.USER.LANGUAGE') },
                { name: 'timezone', label: vm.$t('IDENTITY.USER.TIMEZONE') },
            ]),
            data: {},
        });

        const getUserDetailData = async (userId) => {
            baseState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.get({
                    user_id: userId,
                });
                baseState.data = res;
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
            timestampFormatter,
        };
    },
};
</script>
