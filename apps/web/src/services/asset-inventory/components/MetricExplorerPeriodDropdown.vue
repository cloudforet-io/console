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
    PERIOD_DROPDOWN_MENU,
    PERIOD_DROPDOWN_MENU_ITEM_MAP,
} from '@/services/asset-inventory/constants/metric-explorer-constant';
import {
    getInitialPeriodByGranularity,
    getRefinedPeriod,
} from '@/services/asset-inventory/helpers/metric-explorer-period-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    Granularity, PeriodDropdownMenu,
} from '@/services/asset-inventory/types/metric-explorer-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const state = reactive({
    // period: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[0],
    dailyPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const locale = i18n.locale;
        return [
            {
                name: PERIOD_DROPDOWN_MENU.CURRENT_MONTH,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.THIS_MONTH'),
            },
            {
                name: PERIOD_DROPDOWN_MENU.LAST_MONTH,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_MONTH'),
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
            name: PERIOD_DROPDOWN_MENU.LAST_3_MONTHS,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_3_MONTHS'),
        },
        {
            name: PERIOD_DROPDOWN_MENU.LAST_6_MONTHS,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_6_MONTHS'),
        },
        {
            name: PERIOD_DROPDOWN_MENU.LAST_12_MONTHS,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_12_MONTHS'),
        },
        {
            name: PERIOD_DROPDOWN_MENU.CURRENT_YEAR,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.THIS_YEAR'),
        },
        {
            name: PERIOD_DROPDOWN_MENU.LAST_YEAR,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_YEAR'),
        }])),
    allPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        ...state.dailyPeriodMenuItems,
        ...state.monthlyPeriodMenuItems,
    ])),
    periodMenuItems: computed<MenuItem[]>(() => {
        const menuItems = [
            ...((metricExplorerPageState.granularity === GRANULARITY.DAILY) ? state.dailyPeriodMenuItems : []),
            ...((metricExplorerPageState.granularity === GRANULARITY.MONTHLY) ? state.monthlyPeriodMenuItems : []),
        ];
        const customItem = [{
            type: 'divider',
        }, {
            type: 'item',
            name: 'custom',
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.CUSTOM'),
        }];
        return [
            ...menuItems,
            ...customItem,
        ];
    }),
    selectedPeriod: PERIOD_DROPDOWN_MENU.LAST_6_MONTHS as PeriodDropdownMenu,
    customDateModalVisible: false,
});

/* Util */
const setSelectedPeriodItemByGranularity = (granularity: Granularity) => {
    const [_period, _relativePeriod] = getInitialPeriodByGranularity(granularity);
    metricExplorerPageStore.setPeriod(_period);
    metricExplorerPageStore.setRelativePeriod(_relativePeriod);
    state.selectedPeriod = Object.values(PERIOD_DROPDOWN_MENU_ITEM_MAP).find((item) => isEqual(item.relativePeriod, _relativePeriod))?.name;
};

/* Event */
const handleSelectPeriod = (periodMenuName: string) => {
    if (periodMenuName === 'custom') {
        state.customDateModalVisible = true;
        return;
    }

    state.selectedPeriod = periodMenuName;
    const _selectedPeriodItem = PERIOD_DROPDOWN_MENU_ITEM_MAP[periodMenuName];
    const _relativePeriod = _selectedPeriodItem.relativePeriod;
    const _period = _relativePeriod ? getRefinedPeriod(metricExplorerPageState.granularity, _relativePeriod) : _selectedPeriodItem.period;
    // state.period = _relativePeriod ? getRefinedPeriod(metricExplorerPageState.granularity, _relativePeriod) : _selectedPeriodItem.period;
    metricExplorerPageStore.setPeriod(_period);
    metricExplorerPageStore.setRelativePeriod(_relativePeriod);
};
const handleCustomRangeModalConfirm = (start: string, end: string) => {
    // state.period = period;
    // const start = dayjs.utc(period?.start).format('YYYY-MM');
    // const end = dayjs.utc(period?.end).format('YYYY-MM');
    metricExplorerPageStore.setPeriod({ start, end });
    metricExplorerPageStore.setRelativePeriod(undefined);
    state.selectedPeriod = 'custom';
    state.customDateModalVisible = false;
};

/* Watcher */
watch(() => metricExplorerPageState.granularity, (granularity) => {
    if (granularity) {
        setSelectedPeriodItemByGranularity(granularity);
    }
}, { immediate: false });
</script>

<template>
    <div class="cost-analysis-period-select-dropdown">
        <p-select-dropdown :menu="state.periodMenuItems"
                           :selection-label="$t('INVENTORY.METRIC_EXPLORER.PERIOD.PERIOD')"
                           disable-proxy
                           reset-selection-on-menu-close
                           style-type="rounded"
                           :selected="state.selectedPeriod"
                           @select="handleSelectPeriod"
        />
        <custom-date-modal
            :visible.sync="state.customDateModalVisible"
            :start="metricExplorerPageState.period?.start"
            :end="metricExplorerPageState.period?.end"
            :datetime-picker-data-type="metricExplorerPageState.granularity === GRANULARITY.DAILY ? 'yearToDate' : 'yearToMonth'"
            use-restricted-mode
            @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>
