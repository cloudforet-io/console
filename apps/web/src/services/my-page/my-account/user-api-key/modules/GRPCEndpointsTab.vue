<script setup lang="ts">

import { reactive } from 'vue';

import { PDataTable } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import ErrorHandler from '@/common/composables/error/errorHandler';

interface EndpointItem {
    endpoint: string;
    name: string;
    service: string;
    state?: string;
}

const state = reactive({
    loading: true,
    fields: [
        { name: 'service', label: 'Service' },
        { name: 'name', label: 'Name' },
        { name: 'endpoint', label: 'Endpoint' },
    ],
    items: [] as EndpointItem[],
});
const listEndpoints = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.client.identity.endpoint.list();
        state.items = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

(async () => {
    await listEndpoints();
})();
</script>

<template>
    <div
        class="sub-table-wrapper"
    >
        <div class="sub-table-header">
            gRPC
        </div>
        <p-data-table
            :items="state.items"
            :loading="state.loading"
            :fields="state.fields"
            :striped="false"
        />
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
