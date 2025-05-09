<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import dayjs from 'dayjs';
import { isEmpty, isEqual, range } from 'lodash';

import { PSelectDropdown, PBadge } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

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
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    MetricPeriodMenu,
    RelativePeriod,
} from '@/services/asset-inventory/types/asset-analysis-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const route = useRoute();

const state = reactive({
    dailyPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const locale = i18n.locale;
        return [
            {
                name: METRIC_PERIOD_MENU.LAST_7_DAYS,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_7_DAYS'),
            },
            {
                name: METRIC_PERIOD_MENU.LAST_14_DAYS,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_14_DAYS'),
            },
            {
                name: METRIC_PERIOD_MENU.LAST_30_DAYS,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_30_DAYS'),
            },
            {
                name: METRIC_PERIOD_MENU.CURRENT_MONTH,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.THIS_MONTH'),
            },
            {
                name: METRIC_PERIOD_MENU.LAST_MONTH,
                label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_MONTH'),
            },
            ...(range(12).map((i) => {
                const start = dayjs.utc().subtract(i, 'month').startOf('month');
                const end = dayjs.utc().subtract(i, 'month').endOf('month');
                return {
                    name: start.format('YYYY-MM'),
                    label: dayjs(start).locale(locale).format('MMMM, YYYY'),
                    period: {
                        start: start.format('YYYY-MM-DD'),
                        end: end.format('YYYY-MM-DD'),
                    },
                };
            })),
        ];
    }),
    monthlyPeriodMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: METRIC_PERIOD_MENU.LAST_3_MONTHS,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_3_MONTHS'),
        },
        {
            name: METRIC_PERIOD_MENU.LAST_6_MONTHS,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_6_MONTHS'),
        },
        {
            name: METRIC_PERIOD_MENU.LAST_12_MONTHS,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.LAST_12_MONTHS'),
        },
        {
            name: METRIC_PERIOD_MENU.CURRENT_YEAR,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.PERIOD.THIS_YEAR'),
        },
        {
            name: METRIC_PERIOD_MENU.LAST_YEAR,
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
    selectedPeriod: METRIC_PERIOD_MENU.LAST_7_DAYS as MetricPeriodMenu,
    customDateModalVisible: false,
    hasURLQuery: computed(() => !!route.query && !isEmpty(route.query)),
    showPeriodBadge: computed<boolean>(() => state.selectedPeriod === 'custom'),
    periodBadgeText: computed<string>(() => {
        if (!metricExplorerPageState.period) return '';
        let startDateFormat = 'MMM D';
        if (metricExplorerPageState.granularity === GRANULARITY.MONTHLY) startDateFormat = 'MMM YYYY';
        const endDateFormat = metricExplorerPageState.granularity === GRANULARITY.DAILY ? 'MMM D, YYYY' : startDateFormat;
        //
        const start = dayjs.utc(metricExplorerPageState.period.start);
        let end = dayjs.utc(metricExplorerPageState.period.end);
        if (metricExplorerPageState.granularity === GRANULARITY.DAILY) end = dayjs.utc(metricExplorerPageState.period.end).endOf('month');
        return `${start.format(startDateFormat)} ~ ${end.format(endDateFormat)}`;
    }),
});

/* Util */
const getPeriodItemNameByRelativePeriod = (relativePeriod: RelativePeriod) => Object.values(METRIC_PERIOD_MENU_ITEM_MAP).find((item) => isEqual(item.relativePeriod, relativePeriod))?.name;
const initSelectedPeriod = () => {
    if (metricExplorerPageState.relativePeriod) {
        state.selectedPeriod = getPeriodItemNameByRelativePeriod(metricExplorerPageState.relativePeriod);
    } else if (metricExplorerPageState.granularity === GRANULARITY.DAILY) {
        const selectedPeriodItem = state.dailyPeriodMenuItems.find((item) => isEqual(item?.period, metricExplorerPageState.period));
        state.selectedPeriod = selectedPeriodItem?.name || 'custom';
    } else {
        state.selectedPeriod = 'custom';
    }
    metricExplorerPageStore.setRefreshMetricPeriodDropdown(false);
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
        const _period = convertRelativePeriodToPeriod(metricExplorerPageState.granularity, _relativePeriod);
        metricExplorerPageStore.setPeriod(_period);
        metricExplorerPageStore.setRelativePeriod(_relativePeriod);
    } else {
        const _period = getRefinedDailyPeriod(periodMenuName);
        metricExplorerPageStore.setPeriod(_period);
        metricExplorerPageStore.setRelativePeriod(undefined);
    }
};
const handleCustomRangeModalConfirm = (start: string, end: string) => {
    metricExplorerPageStore.setPeriod({ start, end });
    metricExplorerPageStore.setRelativePeriod(undefined);
    state.selectedPeriod = 'custom';
    state.customDateModalVisible = false;
};

/* Watcher */
watch(() => metricExplorerPageState.refreshMetricPeriodDropdown, (refresh) => {
    if (refresh || state.hasURLQuery) initSelectedPeriod();
}, { immediate: true });
</script>

<template>
    <div class="metric-explorer-period-dropdown flex items-center gap-2">
        <p-select-dropdown :menu="state.periodMenuItems"
                           :selection-label="$t('INVENTORY.METRIC_EXPLORER.PERIOD.PERIOD')"
                           disable-proxy
                           reset-selection-on-menu-close
                           style-type="rounded"
                           :selected="state.selectedPeriod"
                           @select="handleSelectPeriod"
        />
        <p-badge v-if="state.showPeriodBadge"
                 badge-type="subtle"
                 style-type="gray200"
        >
            {{ state.periodBadgeText }}
        </p-badge>
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
