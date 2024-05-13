<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PDefinitionTable, PStatus } from '@spaceone/design-system';
import type { StatusProps } from '@spaceone/design-system/types/data-display/status/type';
import dayjs from 'dayjs';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useServiceAccountAgentStore } from '@/services/asset-inventory/stores/service-account-agent-store';

const serviceAccountAgentStore = useServiceAccountAgentStore();

const storeState = reactive({
    agentInfo: computed(() => serviceAccountAgentStore.state.agentInfo),
    timezone: computed<string>(() => store.state.user.timezone),
});

const state = reactive({
    fields: computed(() => {
        const basicFields = [
            {
                label: 'Cluster Name',
                name: 'cluster_name',
            },
            {
                label: 'Status',
                name: 'state',
                disableCopy: true,
            },
        ];
        const basicDateFields = [
            {
                label: 'Expired at',
                name: 'expired_at',
            },
            {
                label: 'Created',
                name: 'created_at',
            },
        ];
        const optionalFields = state.data.last_accessed_at ? [{
            label: 'Last Access at',
            name: 'last_accessed_at',
        }] : [];
        return [
            ...basicFields,
            ...optionalFields,
            ...basicDateFields,
        ];
    }),
    data: computed(() => ({
        cluster_name: storeState.agentInfo?.options?.cluster_name,
        state: storeState.agentInfo?.last_accessed_at ? storeState.agentInfo?.state : 'DISABLED',
        last_accessed_at: storeState.agentInfo?.last_accessed_at,
        expired_at: storeState.agentInfo?.expired_at,
        created_at: storeState.agentInfo?.created_at,
    })),
});

const connectedStatusFormatter = (value: string): StatusProps => ({
    theme: value === 'ENABLED' ? 'green' : 'gray',
    text: value === 'ENABLED' ? i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.ACTIVE') : i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.INACTIVE'),
});

</script>

<template>
    <p-data-loader class="service-account-connect-cluster-detail"
                   :data="state.data"
                   :loading="false"
    >
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            style-type="white"
        >
            <template #data-state="{value}">
                <p-status v-bind="connectedStatusFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template v-if="state.data.last_accessed_at"
                      #data-last_accessed_at="item"
            >
                {{ dayjs.utc(item.data).tz(storeState.timezone).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template #data-expired_at="item">
                {{ dayjs.utc(item.data).tz(storeState.timezone).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template #data-created_at="item">
                {{ dayjs.utc(item.data).tz(storeState.timezone).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </p-definition-table>
    </p-data-loader>
</template>

<style scoped lang="postcss">
.service-account-connect-cluster-detail {
    min-height: 6.8rem;
    height: 100%;

    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        display: none;
    }

    /* custom design-system component - p-definition-table */
    :deep(.p-definition-table) {
        min-height: auto;
    }

    .no-data-wrapper {
        .text {
            margin-bottom: 1rem;
        }
    }
}
</style>
