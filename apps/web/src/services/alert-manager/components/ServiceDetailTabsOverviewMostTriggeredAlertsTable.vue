<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

interface TableState {
  fields: { name: string; label: string; width: string; }[];
  items: { title: string; triggered_by: string; triggered_cnt: number }[];
  refinedItems: ComputedRef<{ triggered_cnt: number; title: string; triggered_by: string; }[]>;
  loading: boolean;
}

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id),
    webhooks: computed(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
});

const state = reactive({
    dateRangeList: [
        { name: 'this_month', label: i18n.t('ALERT_MANAGER.SERVICE.MOST_TRIGGERED_ALERTS.THIS_MONTH') },
        { name: 'last_month', label: i18n.t('ALERT_MANAGER.SERVICE.MOST_TRIGGERED_ALERTS.LAST_MONTH') },
        { name: 'last_three_months', label: i18n.t('ALERT_MANAGER.SERVICE.MOST_TRIGGERED_ALERTS.LAST_THREE_MONTHS') },
        { name: 'last_six_months', label: i18n.t('ALERT_MANAGER.SERVICE.MOST_TRIGGERED_ALERTS.LAST_SIX_MONTHS') },
        { name: 'last_twelve_months', label: i18n.t('ALERT_MANAGER.SERVICE.MOST_TRIGGERED_ALERTS.LAST_TWELVE_MONTHS') },
    ],
    selectedDateRange: 'this_month',
    startDate: dayjs.utc().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs.utc().endOf('month').format('YYYY-MM-DD'),
});

const tableState = reactive<TableState>({
    fields: [
        { name: 'title', label: 'Title', width: '75%' },
        { name: 'triggered_cnt', label: '', width: '25%' },
    ],
    items: [],
    refinedItems: computed<{ triggered_cnt: number; title: string; triggered_by: string; }[]>(() => {
        if (tableState.items.length > 0) {
            return tableState.items.map((alert) => ({
                title: alert.title,
                triggered_by: alert.triggered_by,
                triggered_cnt: alert.triggered_cnt,
            })).sort((a, b) => b.triggered_cnt - a.triggered_cnt);
        }
        return [];
    }),
    loading: false,
});

watch(() => state.selectedDateRange, () => {
    const lastMonth = dayjs.utc().subtract(1, 'month');
    const threeMonthsAgo = dayjs.utc().subtract(3, 'month');
    const sixMonthsAgo = dayjs.utc().subtract(6, 'month');
    const twelveMonthsAgo = dayjs.utc().subtract(12, 'month');

    switch (state.selectedDateRange) {
    case 'this_month':
        state.startDate = dayjs.utc().startOf('month').format('YYYY-MM-DD');
        state.endDate = dayjs.utc().endOf('month').format('YYYY-MM-DD');
        break;
    case 'last_month':
        state.startDate = lastMonth.startOf('month').format('YYYY-MM-DD');
        state.endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        break;
    case 'last_three_months':
        state.startDate = threeMonthsAgo.startOf('month').format('YYYY-MM-DD');
        state.endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        break;
    case 'last_six_months':
        state.startDate = sixMonthsAgo.startOf('month').format('YYYY-MM-DD');
        state.endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        break;
    case 'last_twelve_months':
        state.startDate = twelveMonthsAgo.startOf('month').format('YYYY-MM-DD');
        state.endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        break;
    default:
        break;
    }
}, { immediate: true, deep: true });

/* API */
const fetchAlertsAnalyze = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.alert.analyze({
            query: {
                group_by: ['title', 'triggered_by'],
                fields: {
                    triggered_cnt: {
                        key: 'triggered_cnt',
                        operator: 'count',
                    },
                },
                filter: [
                    {
                        k: 'service_id',
                        v: storeState.serviceId,
                        o: 'eq',
                    },
                    {
                        k: 'created_at',
                        v: state.startDate,
                        o: 'gt',
                    },
                    {
                        k: 'created_at',
                        v: state.endDate,
                        o: 'lt',
                    },
                ],
            },
        });

        tableState.items = results || [];
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watch([() => storeState.serviceId, () => state.startDate, () => state.endDate], async () => {
    await fetchAlertsAnalyze();
}, { immediate: true, deep: true });

watch(() => tableState.refinedItems, () => {
    tableState.loading = tableState.refinedItems.length <= 0;
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-overview-most-triggered-alerts-table">
        <div class="flex justify-between items-center mb-5">
            <p class="text-[1rem] font-bold">
                {{ $t('ALERT_MANAGER.SERVICE.MOST_FREQUENTLY_OCCURRED_ALERTS') }}
            </p>
            <p-select-dropdown :menu="state.dateRangeList"
                               :selected.sync="state.selectedDateRange"
            />
        </div>
        <p-data-table v-if="tableState.items.length > 0"
                      :fields="tableState.fields"
                      :items="tableState.refinedItems"
                      :loading="tableState.loading"
                      striped
                      :bordered="false"
                      class="alert-table"
        >
            <template #th-triggered_cnt>
                <span />
            </template>
            <template #col-title-format="{value, rowIndex}">
                <div class="flex gap-2">
                    <p-lazy-img
                        :src="storeState.webhooks[tableState.refinedItems[rowIndex].triggered_by] ?
                            storeState.plugins[storeState.webhooks[tableState.refinedItems[rowIndex].triggered_by].data.plugin_info.plugin_id].icon : 'ic_webhook'"
                        error-icon="ic_webhook"
                        width="1.5rem"
                        height="1.5rem"
                    />
                    {{ value }}
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<style scoped lang="postcss">
.alert-table {
    max-height: 350px;
    overflow: auto;
}
</style>
