<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { range } from 'lodash';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

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
                const label = dayjs(start).utc().locale(locale);
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
        <div class="chart-wrapper">
            <div class="chart">
                temp chart area
            </div>
            <div class="legend-wrapper">
                <!-- HACK: temp data -->
                <div class="legend">
                    <span>2023-01-01</span>
                    <span class="count">8</span>
                </div>
                <div class="legend">
                    <span>2023-01-01</span>
                    <span class="count">8</span>
                </div>
            </div>
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
    .chart-wrapper {
        @apply flex;
        height: 100%;
        gap: 1rem;
        .chart {
            @apply bg-gray-100;
            flex: 1;
            height: 100%;
            max-width: 53.875rem;
        }
        .legend-wrapper {
            @apply flex flex-col border border-gray-200;
            width: 12.875rem;
            padding: 0.75rem 1rem;
            border-radius: 0.375rem;
            .legend {
                @apply flex text-paragraph-sm;
                width: 100%;
                padding: 0.125rem 1rem;
                .count {
                    margin-left: auto;
                }
                &:hover {
                    @apply bg-gray-150 cursor-pointer;
                }
            }
        }
    }
}
</style>
