<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { i18n } from '@/translations';

import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

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
                    label: dayjs(start).locale(locale).format('MMMM, YYYY'),
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
    selectedPeriod: {} as Period,
    customDateModalVisible: false,
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
const handleSelectPeriod = (periodMenuName: string) => {
    if (periodMenuName === 'custom') {
        state.customDateModalVisible = true;
        return;
    }

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
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.TITLE')">
            <template #extra>
                <p-select-dropdown :menu="state.periodMenuItems"
                                   :selection-label="$t('INVENTORY.ASSET_ANALYSIS.PERIOD.PERIOD')"
                                   disable-proxy
                                   reset-selection-on-menu-close
                                   style-type="rounded"
                                   :selected="state.selectedPeriod"
                                   @select="handleSelectPeriod"
                />
            </template>
        </p-heading>
    </div>
</template>
