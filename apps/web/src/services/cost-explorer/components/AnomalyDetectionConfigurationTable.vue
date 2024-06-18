<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PToolboxTable, PLink, PLazyImg, PToggleButton,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { getRoleInfo } from '@/services/cost-explorer/composables/anomaly-detection-handler';
import {
    CONFIG_TEMP_DATA,
    DETECTION_CONFIGURATION_HANDLERS,
} from '@/services/cost-explorer/constants/anomaly-detection-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

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
                            name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION.DETAIL._NAME,
                            params: { configId: item.config_id}
                        }"
                >
                    {{ value }}
                </p-link>
            </template>
            <template #col-policy-format="{value}">
                <p-link highlight
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
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
                    <div v-for="(item, idx) in value"
                         :key="idx"
                         class="role-item"
                    >
                        <img v-if="item.type !== ROLE_TYPE.USER"
                             :src="getRoleInfo(item.type)"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span>{{ item.cnt }}</span>
                        <span v-if="item.type === ROLE_TYPE.USER">{{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.USERS') }}</span>
                    </div>
                </div>
            </template>
            <template #col-is_use-format="{value}">
                <p-toggle-button :value="value" />
            </template>
            <template #col-history_button-format="{item}">
                <p-link v-if="item.lasted_at"
                        highlight
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
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
    .col-data-source {
        @apply flex items-center;
        gap: 0.5rem;
    }
    .col-recipients {
        @apply flex;
        gap: 0.5rem;
        .role-item {
            @apply flex items-center;
            gap: 0.125rem;
            .role-type-icon {
                @apply rounded-full;
                width: 1rem;
                height: 1rem;
            }
        }
    }
}
</style>
