<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PToolboxTable, PLink, PLazyImg, PToggleButton, PBadge,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import {
    CONFIG_TEMP_DATA,
    DETECTION_CONFIGURATION_HANDLERS,
} from '@/services/cost-explorer/constants/anomaly-detection-constant';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceGetters.provider),
});
const state = reactive({
    loading: false,
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'name', label: 'Name' },
        { name: 'policy', label: 'Policy' },
        { name: 'data_source', label: 'Data Source' },
        { name: 'recipients', label: 'Recipients', sortable: false },
        { name: 'is_use', label: 'Use' },
        { name: 'lasted_at', label: 'Last Detected' },
        { name: 'history_button', label: ' ', sortable: false },
    ]),
});
</script>

<template>
    <section class="anomaly-detection-configuration-table">
        <p-toolbox-table
            search-type="query"
            searchable
            sortable
            :loading="state.loading"
            :items="CONFIG_TEMP_DATA"
            :fields="tableState.fields"
            sort-by="name"
            :sort-desc="true"
            :total-count="5"
            :key-item-sets="DETECTION_CONFIGURATION_HANDLERS.keyItemSets"
            :value-handler-map="DETECTION_CONFIGURATION_HANDLERS.valueHandlerMap"
        >
            <template #col-name-format="{value, item}">
                <p-link highlight
                        :to="{
                            name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME,
                            params: { configId: item.config_id}
                        }"
                        class="col-name"
                >
                    {{ value }}
                </p-link>
            </template>
            <template #col-policy-format="{value}">
                <p-link action-icon="internal-link"
                        new-tab
                        :to="{}"
                >
                    {{ value }}
                </p-link>
            </template>
            <template #col-data_source-format="{value}">
                <div class="col-data-source">
                    <p-lazy-img width="1rem"
                                height="1rem"
                                :src="assetUrlConverter(storeState.providers[value]?.icon)"
                                alt="provider-icon"
                                class="icon"
                    />
                    <span>{{ storeState.providers[value]?.label }}</span>
                </div>
            </template>
            <template #col-recipients-format="{value}">
                <div class="col-recipients">
                    <span class="role-name">{{ value[0] }}</span>
                    <p-badge v-if="value.length > 1"
                             style-type="blue200"
                             badge-type="subtle"
                    >
                        + {{ value.length - 1 }}
                    </p-badge>
                </div>
            </template>
            <template #col-is_use-format="{value}">
                <p-toggle-button :value="value" />
            </template>
            <template #col-history_button-format="{item}">
                <p-link v-if="item.lasted_at"
                        action-icon="internal-link"
                        new-tab
                        :to="{}"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.VIEW_HISTORY') }}
                </p-link>
                <span v-else>--</span>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-table {

    .col-name {
        /* custom design-system component - p-link */
        :deep(.p-link) {
            @apply block truncate;
            max-width: 12.875rem;
        }
    }
    .col-data-source {
        @apply flex items-center;
        gap: 0.5rem;
    }
    .col-recipients {
        @apply flex items-center;
        gap: 0.5rem;
        .role-name {
            @apply block truncate;
            max-width: 5.625rem;
        }
    }
}
</style>
