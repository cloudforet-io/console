<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable, PEmpty, PSelectDropdown } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

interface TableState {
  fields: { name: string; label: string; }[];
  items: { title: string; triggered_by: string; triggered_cnt: number }[];
  refinedItems: ComputedRef<{ triggered_cnt: number; title: string; triggered_by: string; }[]>;
  loading: boolean;
}

const serviceId = computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id);

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
        { name: 'triggered_cnt', label: '' },
        { name: 'title', label: 'Title' },
        { name: 'triggered_by', label: 'Triggered by' },
    ],
    items: [],
    refinedItems: computed<{ triggered_cnt: number; title: string; triggered_by: string; }[]>(() => {
        if (tableState.items.length > 0) {
            return tableState.items.map((alert) => ({
                triggered_cnt: alert.triggered_cnt,
                title: alert.title,
                triggered_by: alert.triggered_by,
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
                        v: serviceId.value,
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

watch([() => serviceId, () => state.startDate, () => state.endDate], async () => {
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
        </p-data-table>
        <p-empty
            v-else
            :show-image="false"
            :show-button="false"
            class="mt-36"
        >
            {{ $t('ALERT_MANAGER.SERVICE.MOST_FREQUENTLY_OCCURRED_ALERTS_NO_DATA') }}
        </p-empty>
    </div>
</template>

<style scoped lang="postcss">
.alert-table {
    height: 370px;
    overflow: auto;
}
</style>
