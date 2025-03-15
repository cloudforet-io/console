<script setup lang="ts">
import { computed, reactive } from 'vue';

import { capitalize } from 'lodash';

import {
    PToolboxTable, PLink, PLazyImg, PI,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';


import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import {
    DETECTION_HISTORY_HANDLERS, HISTORY_TEMP_DATA, NOTIFY_LEVEL_MAP,
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
        { name: 'config_id', label: 'Detection Configuration' },
        { name: 'policy', label: 'Attached Policy' },
        { name: 'data_source', label: 'Data Source' },
        { name: 'level', label: 'Notice Level' },
        { name: 'detected_at', label: 'Detected' },
    ]),
});
</script>

<template>
    <section class="anomaly-detection-history-table">
        <p-toolbox-table
            search-type="query"
            searchable
            sortable
            :loading="state.loading"
            :items="HISTORY_TEMP_DATA"
            :fields="tableState.fields"
            sort-by="name"
            :sort-desc="true"
            :total-count="5"
            :key-item-sets="DETECTION_HISTORY_HANDLERS.keyItemSets"
            :value-handler-map="DETECTION_HISTORY_HANDLERS.valueHandlerMap"
        >
            <template #col-name-format="{value, item}">
                <p-link highlight
                        :to="{
                            name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME,
                            params: { historyId: item.history_id }
                        }"
                        class="col-name"
                >
                    {{ value }}
                </p-link>
            </template>
            <template #col-config_id-format="{value}">
                <p-link action-icon="internal-link"
                        new-tab
                        :to="{}"
                        class="col-config"
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
            <template #col-level-format="{value}">
                <div class="col-level">
                    <p-i :name="NOTIFY_LEVEL_MAP[value].icon"
                         height="1rem"
                         width="1rem"
                         :color="NOTIFY_LEVEL_MAP[value].color"
                    />
                    <span>{{ capitalize(value) }}</span>
                </div>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style scoped lang="postcss">
.anomaly-detection-history-table {
    .col-name {
        /* custom design-system component - p-link */
        :deep(.p-link) {
            @apply block truncate;
            max-width: 18.375rem;
        }
    }
    .col-config {
        /* custom design-system component - p-link */
        :deep(.p-link) {
            @apply flex;
            .text {
                @apply block truncate;
                max-width: 10.125rem;
            }
        }
    }
    .col-data-source {
        @apply flex items-center;
        gap: 0.5rem;
    }
    .col-level {
        @apply flex items-center;
        gap: 0.25rem;
    }
}
</style>
