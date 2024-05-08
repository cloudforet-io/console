<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';
import { isEqual, range } from 'lodash';

import { i18n } from '@/translations';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';

import {
    GRANULARITY,
    METRIC_PERIOD_MENU,
    METRIC_PERIOD_MENU_ITEM_MAP,
} from '@/services/asset-inventory/constants/asset-analysis-constant';
import {
    convertRelativePeriodToPeriod, getRefinedDailyPeriod,
} from '@/services/asset-inventory/helpers/asset-analysis-period-helper';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';
import type {
    MetricPeriodMenu,
    RelativePeriod,
} from '@/services/asset-inventory/types/asset-analysis-type';


const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const state = reactive({
    dailyPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const locale = i18n.locale;
        return [
            {
                name: METRIC_PERIOD_MENU.LAST_14_DAYS,
                label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_14_DAYS'),
            },
            {
                name: METRIC_PERIOD_MENU.LAST_30_DAYS,
                label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_30_DAYS'),
            },
            {
                name: METRIC_PERIOD_MENU.CURRENT_MONTH,
                label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.THIS_MONTH'),
            },
            {
                name: METRIC_PERIOD_MENU.LAST_MONTH,
                label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_MONTH'),
            },
            ...(range(12).map((i) => {
                const start = dayjs.utc().subtract(i, 'month').startOf('month');
                return {
                    name: start.format('YYYY-MM'),
                    label: dayjs(start).locale(locale).format('MMMM, YYYY'),
                };
            })),
        ];
    }),
    monthlyPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: METRIC_PERIOD_MENU.LAST_3_MONTHS,
            label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_3_MONTHS'),
        },
        {
            name: METRIC_PERIOD_MENU.LAST_6_MONTHS,
            label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_6_MONTHS'),
        },
        {
            name: METRIC_PERIOD_MENU.LAST_12_MONTHS,
            label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_12_MONTHS'),
        },
        {
            name: METRIC_PERIOD_MENU.CURRENT_YEAR,
            label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.THIS_YEAR'),
        },
        {
            name: METRIC_PERIOD_MENU.LAST_YEAR,
            label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.LAST_YEAR'),
        }])),
    allPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        ...state.dailyPeriodMenuItems,
        ...state.monthlyPeriodMenuItems,
    ])),
    periodMenuItems: computed<MenuItem[]>(() => {
        const menuItems = [
            ...((assetAnalysisPageState.granularity === GRANULARITY.DAILY) ? state.dailyPeriodMenuItems : []),
            ...((assetAnalysisPageState.granularity === GRANULARITY.MONTHLY) ? state.monthlyPeriodMenuItems : []),
        ];
        const customItem = [{
            type: 'divider',
        }, {
            type: 'item',
            name: 'custom',
            label: i18n.t('INVENTORY.ASSET_ANALYSIS.PERIOD.CUSTOM'),
        }];
        return [
            ...menuItems,
            ...customItem,
        ];
    }),
    selectedPeriod: METRIC_PERIOD_MENU.LAST_14_DAYS as MetricPeriodMenu,
    customDateModalVisible: false,
});

/* Util */
const getPeriodItemNameByRelativePeriod = (relativePeriod: RelativePeriod) => Object.values(METRIC_PERIOD_MENU_ITEM_MAP).find((item) => isEqual(item.relativePeriod, relativePeriod))?.name;
const initSelectedPeriod = () => {
    if (assetAnalysisPageState.relativePeriod) {
        state.selectedPeriod = getPeriodItemNameByRelativePeriod(assetAnalysisPageState.relativePeriod);
    } else if (assetAnalysisPageState.granularity === GRANULARITY.DAILY) {
        const selectedPeriodItem = state.dailyPeriodMenuItems.find((item) => isEqual(item.name, assetAnalysisPageState.period));
        state.selectedPeriod = selectedPeriodItem?.name;
    } else {
        state.selectedPeriod = 'custom';
    }
    assetAnalysisPageStore.setRefreshMetricPeriodDropdown(false);
};

/* Event */
const handleSelectPeriod = (periodMenuName: string) => {
    if (periodMenuName === 'custom') {
        state.customDateModalVisible = true;
        return;
    }

    state.selectedPeriod = periodMenuName;
    const _selectedPeriodItem = METRIC_PERIOD_MENU_ITEM_MAP[periodMenuName];
    if (_selectedPeriodItem) {
        const _relativePeriod = _selectedPeriodItem.relativePeriod;
        const _period = convertRelativePeriodToPeriod(assetAnalysisPageState.granularity, _relativePeriod);
        assetAnalysisPageStore.setPeriod(_period);
        assetAnalysisPageStore.setRelativePeriod(_relativePeriod);
    } else {
        const _period = getRefinedDailyPeriod(periodMenuName);
        assetAnalysisPageStore.setPeriod(_period);
        assetAnalysisPageStore.setRelativePeriod(undefined);
    }
};
const handleCustomRangeModalConfirm = (start: string, end: string) => {
    assetAnalysisPageStore.setPeriod({ start, end });
    assetAnalysisPageStore.setRelativePeriod(undefined);
    state.selectedPeriod = 'custom';
    state.customDateModalVisible = false;
};

/* Watcher */
watch(() => assetAnalysisPageState.refreshMetricPeriodDropdown, (refresh) => {
    if (refresh) initSelectedPeriod();
}, { immediate: true });
</script>

<template>
    <div>
        <p-select-dropdown :menu="state.periodMenuItems"
                           :selection-label="$t('INVENTORY.ASSET_ANALYSIS.PERIOD.PERIOD')"
                           disable-proxy
                           reset-selection-on-menu-close
                           style-type="rounded"
                           :selected="state.selectedPeriod"
                           @select="handleSelectPeriod"
        />
        <custom-date-modal
            :visible.sync="state.customDateModalVisible"
            :start="assetAnalysisPageState.period?.start"
            :end="assetAnalysisPageState.period?.end"
            :datetime-picker-data-type="assetAnalysisPageState.granularity === GRANULARITY.DAILY ? 'yearToDate' : 'yearToMonth'"
            use-restricted-mode
            @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>
