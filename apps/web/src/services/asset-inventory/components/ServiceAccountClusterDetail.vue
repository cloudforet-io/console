<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PDefinitionTable, PStatus } from '@spaceone/design-system';
import type { StatusProps } from '@spaceone/design-system/types/data-display/status/type';
import dayjs from 'dayjs';

import { store } from '@/store';

import { useServiceAccountAgentStore } from '@/services/asset-inventory/stores/service-account-agent-store';

const serviceAccountAgentStore = useServiceAccountAgentStore();

const storeState = reactive({
    agentInfo: computed(() => serviceAccountAgentStore.state.agentInfo),
    timezone: computed<string>(() => store.state.user.timezone),
});

const state = reactive({
    fields: computed(() => [
        {
            label: 'Cluster Name',
            name: 'cluster_name',
        },
        {
            label: 'Status',
            name: 'state',
            disableCopy: true,
        },
        {
            label: 'Created',
            name: 'created_at',
            disableCopy: true,
        },
    ]),
    data: computed(() => ({
        cluster_name: storeState.agentInfo?.options?.cluster_name,
        state: storeState.agentInfo?.state,
        created_at: storeState.agentInfo?.created_at,
    })),
});

const connectedStatusFormatter = (value: string): StatusProps => ({
    theme: value === 'ENABLED' ? 'green' : 'gray',
    text: value === 'ENABLED' ? 'Connected' : 'Disconnected',
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
            <template #data-created_at="item">
                {{ dayjs(item.data).tz(storeState.timezone).format('YYYY-MM-DD HH:mm:ss') }}
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
