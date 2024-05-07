<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton,
    PDataTable, PHeading, PI,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';

import { i18n } from '@/translations';

import { green, red } from '@/styles/colors';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem, CostJobItem } from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedItem),
    jobList: computed<CostJobItem[]>(() => dataSourcesPageGetters.jobList),
});
const state = reactive({
    loading: false,
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'job_id', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_ID') },
        { name: 'status', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_STATUS') },
        { name: 'total_tasks', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_TOTAL_TASK') },
        { name: 'created_at', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_CREATED_AT') },
        { name: 'duration', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_DURATION') },
    ]),
});

watch(() => storeState.selectedItem, (selectedItem) => {
    if (!selectedItem) return;
    state.loading = true;
    try {
        dataSourcesPageStore.fetchJobList(selectedItem?.data_source_id || '');
    } finally {
        state.loading = false;
    }
}, { immediate: true });
</script>

<template>
    <div class="data-source-management-tab-detail-base-information">
        <p-heading heading-type="sub"
                   use-total-count
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_COLLECTION_JOB')"
                   :total-count="storeState.jobList.length"
                   class="title"
        />
        <p-data-table :fields="tableState.fields"
                      :items="storeState.jobList"
                      style-type="white"
                      :loading="state.loading"
                      class="data-source-definition-table"
                      v-on="$listeners"
        >
            <template #col-status-format="{value}">
                <p-i :name="(value === 'SUCCESS') ? 'ic_check' : 'ic_error-filled'"
                     :color="(value === 'SUCCESS') ? green[600] : red[400]"
                     width="1rem"
                     height="1rem"
                     class="icon-info"
                />
                <span v-if="value === 'SUCCESS'">
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SUCCESS') }}
                </span>
                <p-button v-else
                          size="sm"
                          style-type="tertiary"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND') }}
                </p-button>
            </template>
        </p-data-table>
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-detail-base-information {
    .title {
        margin-top: 2.25rem;
    }
    .data-source-definition-table {
        padding-top: 0.5rem;
        .icon-info {
            margin-right: 0.5rem;
        }
    }
}
</style>

