<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';
import { isEqual, range } from 'lodash';

import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import {
    convertRelativePeriodToPeriod,
    initiatePeriodByGranularity,
} from '@/services/cost-explorer/cost-analysis/lib/period-helper';
import type { RelativePeriod } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity, Period } from '@/services/cost-explorer/type';
import CustomDateRangeModal from '@/services/dashboards/shared/CustomDateRangeModal.vue';


const today = dayjs.utc();
interface PeriodItem extends SelectDropdownMenu {
    period?: {
        start: string
        end: string;
    };
    relativePeriod?: RelativePeriod;
}

export interface ParamsForSelectedPeriod {
    relativePeriod?: RelativePeriod;
    period?: Period;
    granularity?: Granularity;
}

const props = defineProps<{
    localGranularity?: Granularity;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const { i18nDayjs } = useI18nDayjs();
const state = reactive({
    period: initiatePeriodByGranularity(GRANULARITY.MONTHLY)[0],
    dailyPeriodItems: computed<PeriodItem[]>(() => (range(12).map((i) => {
        const start = today.subtract(i, 'month');
        const end = today.subtract(i, 'month');
        return {
            name: start.format('YYYY-MM'),
            label: i18nDayjs.value(start).format('MMMM, YYYY'),
            period: {
                start: start.format('YYYY-MM'),
                end: end.format('YYYY-MM'),
            },
        };
    }))),
    monthlyPeriodItems: computed<PeriodItem[]>(() => ([
        {
            name: 'thisMonth',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_MONTH'),
            relativePeriod: { unit: 'month', value: 0, include_today: true },
        },
        {
            name: 'lastMonth',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_MONTH'),
            relativePeriod: { unit: 'month', value: 1, include_today: false },
        },
        {
            name: 'last3Month',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_MONTHS'),
            relativePeriod: { unit: 'month', value: 2, include_today: true },
        },
        {
            name: 'last6Month',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_6_MONTHS'),
            relativePeriod: { unit: 'month', value: 5, include_today: true },
        }])),
    yearlyPeriodItems: computed<PeriodItem[]>(() => ([
        {
            name: 'thisYear',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_YEAR'),
            relativePeriod: { unit: 'year', value: 0, include_today: true },
        },
        {
            name: 'lastYear',
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_YEAR'),
            relativePeriod: { unit: 'year', value: 1, include_today: false },
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
});

/* Util */
const getPeriodItemNameByRelativePeriod = (relativePeriod?: RelativePeriod) => state.allPeriodItems.find((item) => isEqual(item.relativePeriod, relativePeriod))?.name;

const setSelectedItemByGranularity = (granularity) => {
    if (granularity) {
        const [defaultPeriod, defaultRelativePeriod] = initiatePeriodByGranularity(granularity);
        costAnalysisPageStore.$patch((_state) => {
            _state.period = defaultPeriod;
            _state.relativePeriod = defaultRelativePeriod;
        });
        if (granularity === GRANULARITY.DAILY) {
            state.selectedPeriod = today.subtract(0, 'month').format('YYYY-MM');
        } else {
            state.selectedPeriod = getPeriodItemNameByRelativePeriod(defaultRelativePeriod);
        }
    }
};
const setSelectedItemByQuerySet = ({ relativePeriod, period, granularity }:ParamsForSelectedPeriod) => {
    if (granularity) {
        costAnalysisPageStore.$patch((_state) => {
            _state.granularity = granularity;
        });
    }
    if (relativePeriod) {
        state.selectedPeriod = getPeriodItemNameByRelativePeriod(relativePeriod);
    } else if (granularity === GRANULARITY.DAILY) {
        const selectedPeriodItem:PeriodItem|undefined = state.dailyPeriodItems.find((item) => isEqual(item.period, period));
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
        state.period = selectedPeriodItem.relativePeriod ? convertRelativePeriodToPeriod(selectedPeriodItem.relativePeriod) : selectedPeriodItem.period;
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

watch(() => props.localGranularity, (granularity) => {
    if (granularity) setSelectedItemByGranularity(granularity);
});

watch(() => costAnalysisPageStore.selectedQuerySet, async (selectedQuery) => {
    setSelectedItemByQuerySet({
        relativePeriod: selectedQuery?.options?.relative_period,
        period: selectedQuery?.options?.period,
        granularity: selectedQuery?.options?.granularity,
    });
}, {
    immediate: true,
});
watch(() => costAnalysisPageState.period, (period) => {
    if (period && !costAnalysisPageState.relativePeriod) {
        state.selectedPeriod = 'custom';
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-analysis-period-select-dropdown">
        <p-select-dropdown :items="state.periodMenuItems"
                           :selected="state.selectedPeriod"
                           @select="handleSelectPeriod"
        />
        <custom-date-range-modal :visible.sync="state.customRangeModalVisible"
                                 :granularity="costAnalysisPageState.granularity"
                                 :selected-date-range="state.period"
                                 @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-period-select-dropdown {
    .p-badge {
        margin-right: 0.5rem;
        .text {
            white-space: nowrap;
        }
    }

    @screen mobile {
        @apply flex flex-wrap justify-end items-center;
        width: 100%;
    }
}

</style>
