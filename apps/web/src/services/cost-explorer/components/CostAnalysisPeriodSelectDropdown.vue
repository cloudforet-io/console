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

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import CostAnalysisCustomDateRangeModal from '@/services/cost-explorer/components/CostAnalysisCustomDateRangeModal.vue';
import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constants';
import {
    convertRelativePeriodToPeriod,
    initiatePeriodByGranularity,
} from '@/services/cost-explorer/helpers/cost-explorer-period-helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type {
    Granularity, Period, CostQuerySetOption, RelativePeriod,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


const today = dayjs.utc();
interface PeriodItem extends SelectDropdownMenuItem {
    period?: {
        start: string
        end: string;
    };
    relativePeriod?: RelativePeriod;
}

const props = defineProps<{
    optionForInitialPeriod?: CostQuerySetOption;
    granularity?: Granularity;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const { i18nDayjs } = useI18nDayjs();
const state = reactive({
    period: initiatePeriodByGranularity(GRANULARITY.MONTHLY)[0],
    dailyPeriodItems: computed<PeriodItem[]>(() => [
        {
            name: 'ThisMonth',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_MONTH'),
            relativePeriod: { unit: 'month', value: 0, include_today: true },
        },
        {
            name: 'lastMonth',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_MONTH'),
            relativePeriod: { unit: 'month', value: 1, include_today: false },
        },
        ...(range(12).map((i) => {
            const start = today.subtract(i, 'month').startOf('month');
            const end = today.subtract(i, 'month').endOf('month');
            return {
                name: start.format('YYYY-MM'),
                label: i18nDayjs.value(start).format('MMMM, YYYY'),
                period: {
                    start: start.format('YYYY-MM'),
                    end: end.format('YYYY-MM'),
                },
            };
        }))]),
    monthlyPeriodItems: computed<PeriodItem[]>(() => ([
        {
            name: 'last3Month',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_MONTHS'),
            relativePeriod: { unit: 'month', value: 2, include_today: true },
        },
        {
            name: 'last6Month',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_6_MONTHS'),
            relativePeriod: { unit: 'month', value: 5, include_today: true },
        },
        {
            name: 'last12Months',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_12_MONTHS'),
            relativePeriod: { unit: 'month', value: 11, include_today: true },
        },
        {
            name: 'ThisYear',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_YEAR'),
            relativePeriod: { unit: 'year', value: 0, include_today: true },
        },
        {
            name: 'lastYear',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_YEAR'),
            relativePeriod: { unit: 'year', value: 1, include_today: false },
        }])),
    yearlyPeriodItems: computed<PeriodItem[]>(() => ([
        {
            name: 'last3Years',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_YEARS'),
            relativePeriod: { unit: 'year', value: 2, include_today: true },
        },
    ])),
    allPeriodItems: computed<PeriodItem[]>(() => ([
        ...state.dailyPeriodItems,
        ...state.monthlyPeriodItems,
        ...state.yearlyPeriodItems,
    ])),
    periodMenuItems: computed<MenuItem[]>(() => {
        const menuItems = [
            ...((costAnalysisPageState.granularity === GRANULARITY.DAILY) ? state.dailyPeriodItems : []),
            ...((costAnalysisPageState.granularity === GRANULARITY.MONTHLY) ? state.monthlyPeriodItems : []),
            ...((costAnalysisPageState.granularity === GRANULARITY.YEARLY) ? state.yearlyPeriodItems : []),
        ];
        const customItem = (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) ? [{
            type: 'divider',
        }, {
            type: 'item',
            name: 'custom',
            label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOM'),
        }] : [];
        return [
            ...menuItems,
            ...customItem,
        ];
    }),
    selectedPeriod: 'last6Month',
    customRangeModalVisible: false,
    isPeriodInvalid: computed<boolean>(() => costAnalysisPageStore.isPeriodInvalid),
});

/* Util */
const getPeriodItemNameByRelativePeriod = (relativePeriod?: RelativePeriod) => state.allPeriodItems.find((item) => isEqual(item.relativePeriod, relativePeriod))?.name;

const setSelectedItemByGranularity = (granularity:Granularity) => {
    const [defaultPeriod, defaultRelativePeriod] = initiatePeriodByGranularity(granularity);
    costAnalysisPageStore.$patch((_state) => {
        _state.period = defaultPeriod;
        _state.relativePeriod = defaultRelativePeriod;
    });
    state.selectedPeriod = getPeriodItemNameByRelativePeriod(defaultRelativePeriod);
};
const setSelectedItemByQuerySet = ({ relativePeriod, period, granularity }:{
    relativePeriod?: RelativePeriod;
    period?: Period;
    granularity?: Granularity;
}) => {
    if (relativePeriod) {
        state.selectedPeriod = getPeriodItemNameByRelativePeriod(relativePeriod);
    } else if (granularity === GRANULARITY.DAILY) {
        const selectedPeriodItem:PeriodItem|undefined = state.dailyPeriodItems.find((item:PeriodItem) => isEqual(item.period, period));
        state.selectedPeriod = selectedPeriodItem?.name;
    } else {
        state.selectedPeriod = 'custom';
    }
};
const setPeriodMenuItemWithPeriod = (period?: Period) => {
    const start = dayjs.utc(period?.start).format('YYYY-MM');
    const end = dayjs.utc(period?.end).format('YYYY-MM');
    costAnalysisPageStore.$patch((_state) => {
        _state.period = { start, end };
        _state.relativePeriod = undefined;
    });
    state.selectedPeriod = 'custom';
};

/* Event */
const handleSelectPeriod = (periodMenuName) => {
    state.selectedPeriod = periodMenuName;
    if (periodMenuName === 'custom') state.customRangeModalVisible = true;
    else {
        const selectedPeriodItem: PeriodItem = state.allPeriodItems.find((d) => d.name === periodMenuName);
        state.period = selectedPeriodItem.relativePeriod ? convertRelativePeriodToPeriod({
            relativePeriod: selectedPeriodItem.relativePeriod,
            granularity: costAnalysisPageState.granularity,
        }) : selectedPeriodItem.period;
        costAnalysisPageStore.$patch((_state) => {
            _state.period = state.period;
            _state.relativePeriod = selectedPeriodItem.relativePeriod;
        });
    }
};
const handleCustomRangeModalConfirm = (period: Period) => {
    state.period = period;
    if (period) {
        setPeriodMenuItemWithPeriod(period);
    }
    state.customRangeModalVisible = false;
};


watch([() => props.optionForInitialPeriod, () => props.granularity], ([option, _granularity], [prevOption]) => {
    if (option !== prevOption && option) {
        const { relative_period, period, granularity } = option;
        setSelectedItemByQuerySet({ relativePeriod: relative_period, period, granularity });
    } else if (_granularity) {
        setSelectedItemByGranularity(_granularity);
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-analysis-period-select-dropdown">
        <p-select-dropdown :menu="state.periodMenuItems"
                           :selection-label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.PERIOD')"
                           style-type="rounded"
                           :selected="state.selectedPeriod"
                           :invalid="state.isPeriodInvalid"
                           @select="handleSelectPeriod"
        />
        <cost-analysis-custom-date-range-modal
            :visible.sync="state.customRangeModalVisible"
            :selected-date-range="state.period"
            @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>
