<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { range } from 'lodash';

import {
    PHeading, PSelectDropdown, PBadge, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import AnomalyDetectionHistoryTable from '@/services/cost-explorer/components/AnomalyDetectionHistoryTable.vue';
import {
    ANOMALY_DETECTION_MENU,
    ANOMALY_DETECTION_MENU_ITEM_MAP,
} from '@/services/cost-explorer/constants/anomaly-detection-constant';
import type { Period } from '@/services/cost-explorer/types/anomaly-detection-type';

const state = reactive({
    periodMenuItems: computed<MenuItem[]>(() => {
        const locale = i18n.locale;
        return [
            {
                name: ANOMALY_DETECTION_MENU.ALL,
                label: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.ALL'),
            },
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
            {
                name: ANOMALY_DETECTION_MENU.THIS_MONTH,
                label: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.THIS_MONTH'),
            },
            {
                name: ANOMALY_DETECTION_MENU.LAST_MONTH,
                label: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.LAST_MONTH'),
            },
            ...(range(4).map((i) => {
                const start = dayjs.utc().subtract(i + 2, 'month').startOf('month');
                return {
                    name: start.format('YYYY-MM'),
                    label: dayjs(start).utc().locale(locale).format('MMMM, YYYY'),
                };
            })),
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
            {
                name: ANOMALY_DETECTION_MENU.CUSTOM,
                label: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.CUSTOM'),
            },
        ];
    }),
    selectedPeriodItem: ANOMALY_DETECTION_MENU.ALL as string,
    selectedPeriod: undefined as Period|undefined,
    customPeriod: undefined as Period|undefined,
    customPeriodModalVisible: false,
});

const convertRelativePeriodToPeriod = (_includeToday: boolean): Period => {
    const today = dayjs.utc();
    const dateFormat = 'YYYY-MM-DD';
    return {
        start: today.subtract(_includeToday ? 0 : 1, 'month').startOf('month').format(dateFormat),
        end: today.subtract(_includeToday ? 0 : 1, 'month').endOf('month').format(dateFormat),
    };
};
const getRefinedDailyPeriod = (yearMonth: string): Period => ({
    start: dayjs.utc(yearMonth).startOf('month').format('YYYY-MM-DD'),
    end: dayjs.utc(yearMonth).endOf('month').format('YYYY-MM-DD'),
});
const handleConfirmCustomPeriod = (start: string, end: string): void => {
    state.selectedPeriod = undefined;
    state.selectedPeriodItem = ANOMALY_DETECTION_MENU.CUSTOM;
    state.customPeriod = { start, end };
};
const handleSelectPeriod = (periodMenuName: string) => {
    if (periodMenuName === ANOMALY_DETECTION_MENU.CUSTOM) {
        state.customPeriodModalVisible = true;
        return;
    }

    state.customPeriod = undefined;
    state.selectedPeriodItem = periodMenuName;
    const _selectedPeriodItem = ANOMALY_DETECTION_MENU_ITEM_MAP[periodMenuName];
    if (_selectedPeriodItem) {
        if (_selectedPeriodItem.name !== ANOMALY_DETECTION_MENU.ALL) {
            const _includeToday = _selectedPeriodItem.include_today;
            state.selectedPeriod = convertRelativePeriodToPeriod(_includeToday);
        }
    } else {
        state.selectedPeriod = getRefinedDailyPeriod(periodMenuName);
    }
};
</script>

<template>
    <div class="anomaly-detection-history-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.TITLE')" />
            </template>
            <template #extra>
                <p-select-dropdown :menu="state.periodMenuItems"
                                   :selection-label="$t('INVENTORY.ASSET_ANALYSIS.PERIOD.PERIOD')"
                                   disable-proxy
                                   reset-selection-on-menu-close
                                   style-type="rounded"
                                   :selected.sync="state.selectedPeriodItem"
                                   @select="handleSelectPeriod"
                />
                <p-badge v-if="state.customPeriod?.start"
                         class="custom-period"
                         style-type="gray200"
                         badge-type="subtle"
                >
                    <span>{{ state.customPeriod?.start }} ~ {{ state.customPeriod?.end }}</span>
                </p-badge>
            </template>
        </p-heading-layout>
        <anomaly-detection-history-table />
        <custom-date-modal :visible.sync="state.customPeriodModalVisible"
                           disable-future
                           :start="state.customPeriod?.start"
                           :end="state.customPeriod?.end"
                           @confirm="handleConfirmCustomPeriod"
        />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-history-page {
    @apply flex flex-col;
    .custom-period {
        height: 1.25rem;
    }
}
</style>
