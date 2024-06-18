<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { i18n } from '@/translations';

import {
    ANOMALY_DETECTION_MENU,
} from '@/services/cost-explorer/constants/anomaly-detection-constant';
import type { Period } from '@/services/cost-explorer/types/anomaly-detection-type';

const dropdownState = reactive({
    periodMenuItems: computed<MenuItem[]>(() => {
        const locale = i18n.locale;
        return [
            {
                name: ANOMALY_DETECTION_MENU.LAST_MONTHS,
                label: `${i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.LAST_12_MONTHS')} (${dayjs.utc().format('YYYY-MM')} ~ ${dayjs.utc().subtract(12, 'month').format('YYYY-MM')})`,
            },
            ...(range(3).map((i) => {
                const start = dayjs.utc().subtract(i + 1, 'year').startOf('year');
                const label = dayjs(start).locale(locale);
                return {
                    name: start.format('YYYY-MM'),
                    label: `${label.format('YYYY')} (${label.startOf('year').format('YYYY-MM')} ~ ${label.endOf('year').format('YYYY-MM')})`,
                };
            })),
        ];
    }),
    selectedPeriodItem: ANOMALY_DETECTION_MENU.LAST_MONTHS as string,
    selectedPeriod: {} as Period,
});

const getRefinedDailyPeriod = (yearMonth: string): Period => ({
    start: dayjs.utc(yearMonth).startOf('year').format('YYYY-MM-DD'),
    end: dayjs.utc(yearMonth).endOf('year').format('YYYY-MM-DD'),
});
const convertRelativePeriodToPeriod = (): Period => {
    const today = dayjs.utc();
    const dateFormat = 'YYYY-MM-DD';
    return {
        start: today.startOf('month').format(dateFormat),
        end: today.subtract(12, 'month').endOf('month').format(dateFormat),
    };
};
const handleSelectPeriod = (periodMenuName: string) => {
    dropdownState.selectedPeriodItem = periodMenuName;
    if (periodMenuName === ANOMALY_DETECTION_MENU.LAST_MONTHS) {
        dropdownState.selectedPeriod = convertRelativePeriodToPeriod();
    } else {
        dropdownState.selectedPeriod = getRefinedDailyPeriod(periodMenuName);
    }
};
</script>

<template>
    <div class="anomaly-detection-configuration-trend">
        <div class="heading">
            <span class="title">{{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TREND_TITLE') }}</span>
            <p-select-dropdown class="select-period-dropdown"
                               style-type="transparent"
                               :menu="dropdownState.periodMenuItems"
                               :selected.sync="dropdownState.selectedPeriodItem"
                               @select="handleSelectPeriod"
            />
        </div>
        <div class="chart">
            temp chart area
        </div>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-trend {
    @apply flex flex-col bg-white border border-gray-200;
    height: 18rem;
    padding: 0.75rem 1.5rem 1rem;
    border-radius: 0.375rem;
    gap: 1rem;
    .heading {
        @apply flex items-center;
        gap: 0.75rem;
        .title {
            @apply text-label-lg font-bold;
        }
    }
    .chart {
        @apply bg-gray-100;
        height: 100%;
    }
}
</style>
