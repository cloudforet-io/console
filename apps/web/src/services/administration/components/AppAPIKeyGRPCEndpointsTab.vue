<script setup lang="ts">

import { PDataTable } from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { useEndpointStore } from '@/services/my-page/stores/endpoint-store';

const endpointStore = useEndpointStore();
const endpointState = endpointStore.state;
const fields: DataTableField[] = [
    { name: 'service', label: 'Service' },
    { name: 'name', label: 'Name' },
    { name: 'endpoint', label: 'Endpoint' },
];

endpointStore.listEndpoints();

</script>

<template>
    <div
        class="sub-table-wrapper"
    >
        <div class="sub-table-header">
            gRPC {{ $t('IDENTITY.USER.API_KEY.ENDPOINTS') }}
        </div>
        <p-data-table
            :items="endpointState.endpoints"
            :loading="endpointState.loading"
            :fields="fields"
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
