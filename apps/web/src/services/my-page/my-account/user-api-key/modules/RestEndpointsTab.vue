<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PDataTable, PLink } from '@spaceone/design-system';

import config from '@/lib/config';


interface EndpointItem {
    endpoint: string;
    service: string;
}

const state = reactive({
    activeTab: 'rest',
    fields: [
        { name: 'service', label: 'Service' },
        { name: 'endpoint', label: 'Endpoint' },
    ],
    items: computed<EndpointItem[]>(() => [{
        service: 'Swagger',
        endpoint: `${config.get('CONSOLE_API_V2.ENDPOINT')}/docs`,
    }]),
});
</script>

<template>
    <div
        class="sub-table-wrapper"
    >
        <div class="sub-table-header">
            REST {{ $t('IDENTITY.USER.MAIN.ENDPOINTS') }}
        </div>
        <p-data-table
            :items="state.items"
            :fields="state.fields"
            :striped="false"
        >
            <template #col-endpoint-format="{ item }">
                <p-link
                    :text="item.endpoint"
                    :href="item.endpoint"
                    highlight
                    action-icon="external-link"
                >
                    {{ item.endpoint }}
                </p-link>
            </template>
        </p-data-table>
    </div>
</template>

<style scoped lang="postcss">
.sub-table-header {
    padding-left: 1rem;
    padding-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.375rem;
    line-height: 145%;
}
</style>
