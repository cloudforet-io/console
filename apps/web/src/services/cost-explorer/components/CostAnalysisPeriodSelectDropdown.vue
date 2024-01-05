<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';
import { isEqual, range } from 'lodash';

import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { i18n } from '@/translations';

import { queryStringToObject, queryStringToString } from '@/lib/router-query-string';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import CostAnalysisCustomDateRangeModal from '@/services/cost-explorer/components/CostAnalysisCustomDateRangeModal.vue';
import {
    PERIOD_DROPDOWN_MENU, PERIOD_DROPDOWN_MENU_ITEM_MAP,
} from '@/services/cost-explorer/constants/cost-analysis-period-constant';
import {
    GRANULARITY,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import {
    convertRelativePeriodToPeriod,
    initiatePeriodByGranularity,
} from '@/services/cost-explorer/helpers/cost-explorer-period-helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type { PeriodDropdownMenu } from '@/services/cost-explorer/types/cost-analysis-period-type';
import type {
    Granularity, Period, RelativePeriod,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


const today = dayjs.utc();
interface PeriodItem extends SelectDropdownMenuItem {
    period?: {
        start: string
        end: string;
    };
    relativePeriod?: RelativePeriod;
}

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;

const route = useRoute();
const router = useRouter();
const { i18nDayjs } = useI18nDayjs();
const state = reactive({
    period: initiatePeriodByGranularity(GRANULARITY.MONTHLY)[0],
    dailyPeriodItems: computed<PeriodItem[]>(() => [
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.CURRENT_MONTH,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_MONTH'),
        },
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.LAST_MONTH,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_MONTH'),
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
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.LAST_3_MONTHS,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_MONTHS'),
        },
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.LAST_6_MONTHS,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_6_MONTHS'),
        },
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.LAST_12_MONTHS,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_12_MONTHS'),
        },
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.CURRENT_YEAR,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_YEAR'),
        },
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.LAST_YEAR,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_YEAR'),
        }])),
    yearlyPeriodItems: computed<PeriodItem[]>(() => ([
        {
            ...PERIOD_DROPDOWN_MENU_ITEM_MAP.LAST_3_YEARS,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_YEARS'),
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
    selectedPeriod: PERIOD_DROPDOWN_MENU.LAST_6_MONTHS as PeriodDropdownMenu,
    customRangeModalVisible: false,
    isPeriodInvalid: computed<boolean>(() => costAnalysisPageGetters.isPeriodInvalid),
});

/* Util */
const getPeriodItemNameByRelativePeriod = (relativePeriod?: RelativePeriod): PeriodDropdownMenu => state.allPeriodItems.find((item) => isEqual(item.relativePeriod, relativePeriod))?.name;
const setSelectedItemByGranularity = (granularity: Granularity, period?: Period) => {
    if (period) {
        costAnalysisPageStore.setPeriod(period);
        costAnalysisPageStore.setRelativePeriod(undefined);
        state.selectedPeriod = 'custom';
        return;
    }
    const [defaultPeriod, defaultRelativePeriod] = initiatePeriodByGranularity(granularity);
    costAnalysisPageStore.setPeriod(defaultPeriod);
    costAnalysisPageStore.setRelativePeriod(defaultRelativePeriod);
    state.selectedPeriod = getPeriodItemNameByRelativePeriod(defaultRelativePeriod);
};
const init = (querySet?: CostQuerySetModel) => {
    if (querySet) {
        // set selected item by query set
        if (querySet.options?.relative_period) {
            state.selectedPeriod = getPeriodItemNameByRelativePeriod(querySet.options?.relative_period);
        } else if (querySet.options?.granularity === GRANULARITY.DAILY) {
            const selectedPeriodItem:PeriodItem|undefined = state.dailyPeriodItems.find((item:PeriodItem) => isEqual(item.period, querySet.options?.period));
            state.selectedPeriod = selectedPeriodItem?.name;
        } else {
            state.selectedPeriod = 'custom';
        }
    } else if (route.params.costQuerySetId === DYNAMIC_COST_QUERY_SET_PARAMS) {
        // set selected item by url query
        const currentQuery = router.currentRoute.query;
        const _granularity = queryStringToString(currentQuery.granularity);
        const _period = queryStringToObject(currentQuery.period);
        setSelectedItemByGranularity(_granularity as Granularity, _period as Period|undefined);
    }
};

/* Event */
const handleSelectPeriod = (periodMenuName: string) => {
    if (periodMenuName === 'custom') state.customRangeModalVisible = true;
    else {
        state.selectedPeriod = periodMenuName;
        const selectedPeriodItem: PeriodItem = state.allPeriodItems.find((d) => d.name === periodMenuName);
        state.period = selectedPeriodItem.relativePeriod ? convertRelativePeriodToPeriod({
            relativePeriod: selectedPeriodItem.relativePeriod,
            granularity: costAnalysisPageState.granularity,
        }) : selectedPeriodItem.period;
        costAnalysisPageStore.setPeriod(state.period);
        costAnalysisPageStore.setRelativePeriod(selectedPeriodItem.relativePeriod);
    }
};
const handleCustomRangeModalConfirm = (period: Period) => {
    state.period = period;
    if (period) {
        const start = dayjs.utc(period?.start).format('YYYY-MM');
        const end = dayjs.utc(period?.end).format('YYYY-MM');

        costAnalysisPageStore.setPeriod({ start, end });
        costAnalysisPageStore.setRelativePeriod(undefined);
        state.selectedPeriod = 'custom';
    }
    state.customRangeModalVisible = false;
};

watch(() => costAnalysisPageGetters.selectedQuerySet, async (selectedQuerySet) => {
    init(selectedQuerySet);
}, { immediate: true });
watch(() => costAnalysisPageState.granularity, (granularity) => {
    if (granularity) {
        setSelectedItemByGranularity(granularity, undefined);
    }
}, { immediate: false });
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
