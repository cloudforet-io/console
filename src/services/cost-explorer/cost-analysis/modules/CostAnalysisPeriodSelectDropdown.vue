<template>
    <div class="cost-analysis-period-select-dropdown" :class="{responsive: !printMode}">
        <p-badge style-type="gray200">
            <p class="text">
                {{ periodText }}
            </p>
        </p-badge>
        <p-select-dropdown v-if="!printMode"
                           :items="periodMenuItems"
                           :selected="selectedPeriodMenuItem"
                           style-type="transparent"
                           @select="handleSelectPeriodMenuItem"
        />
        <cost-management-custom-range-modal v-if="customRangeModalVisible"
                                            :visible.sync="customRangeModalVisible"
                                            :granularity="granularity"
                                            @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import dayjs, { Dayjs } from 'dayjs';
import { Period } from '@/services/cost-explorer/type';
import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import { i18n } from '@/translations';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';
import { store } from '@/store';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';

const CostManagementCustomRangeModal = () => import('@/services/cost-explorer/modules/CostManagementCustomRangeModal.vue');

const today = dayjs.utc();
const basicFormat = (date: Dayjs) => date.format('YYYY-MM-DD');
const subDate = (value: number, unit: string) => today.subtract(value, unit);
export const PERIOD_MENU_LIST = Object.freeze({
    last7days: { start: basicFormat(subDate(6, 'day')), end: basicFormat(today) },
    last14days: { start: basicFormat(subDate(14, 'day')), end: basicFormat(today) },
    thisMonth: { start: basicFormat(today.startOf('month')), end: basicFormat(today.endOf('month')) },
    lastMonth: { start: basicFormat(subDate(1, 'month').startOf('month')), end: basicFormat(subDate(1, 'month').endOf('month')) },
    last3months: { start: basicFormat(subDate(2, 'month').startOf('month')), end: basicFormat(today.endOf('month')) },
    last6months: { start: basicFormat(subDate(5, 'month').startOf('month')), end: basicFormat(today.endOf('month')) },
});

export default {
    name: 'CostAnalysisPeriodSelectDropdown',
    components: {
        CostManagementCustomRangeModal,
        PSelectDropdown,
        PBadge,
    },
    props: {
        fixedPeriod: {
            type: Object,
            default: () => (PERIOD_MENU_LIST.thisMonth),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();
        const arraySelector = (selectedNums: number[], array) => selectedNums.map(num => array[num]);
        const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);
        const state = reactive({
            period: computed<Period>({
                get() { return props.fixedPeriod; },
                set(period) { store.commit('service/costAnalysis/setPeriod', period); },
            }),
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            quickSelectPeriodMenuItems: computed(() => ([
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_7_DAYS'), name: 'last7days' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_14_DAYS'), name: 'last14days' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_MONTH'), name: 'thisMonth' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_MONTH'), name: 'lastMonth' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_MONTHS'), name: 'last3months' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_6_MONTHS'), name: 'last6months' },
            ])),
            quickSelectPeriodListByGranularity: computed(() => {
                if (state.granularity === GRANULARITY.DAILY) return arraySelector([0, 1, 2, 3], state.quickSelectPeriodMenuItems);
                if (state.granularity === GRANULARITY.MONTHLY) return arraySelector([2, 3, 4, 5], state.quickSelectPeriodMenuItems);
                return state.quickSelectPeriodMenuItems;
            }),
            periodMenuItems: computed<MenuItem[]>(() => ([
                ...state.quickSelectPeriodListByGranularity,
                {
                    type: 'divider',
                },
                {
                    type: 'item',
                    name: 'custom',
                    label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOM'),
                },
            ])),
            selectedPeriodMenuItem: 'thisMonth',
            customRangeModalVisible: false,
            periodText: computed(() => {
                const isSameMonth: boolean = dateFormatter(state.period.start, 'M') === dateFormatter(state.period.end, 'M');
                const start = state.period.start;
                const end = state.period.end;
                if (isSameMonth) {
                    return `${dateFormatter(start, 'MMMM D')} ~ ${dateFormatter(end, 'D')}, ${dateFormatter(end, 'YYYY')}`;
                }
                if (state.granularity === GRANULARITY.MONTHLY) {
                    return `${dateFormatter(start, 'MMMM')}, ${dateFormatter(start, 'YYYY')} ~ ${dateFormatter(end, 'MMMM')}, ${dateFormatter(end, 'YYYY')}`;
                }
                return `${dateFormatter(start, 'MMMM D')}, ${dateFormatter(start, 'YYYY')} ~ ${dateFormatter(end, 'MMMM D')}, ${dateFormatter(end, 'YYYY')}`;
            }),
        });

        const setPeriod = (period: Period) => {
            state.period = period;
            emit('update', period);
        };

        const handleSelectPeriodMenuItem = (periodMenuItem) => {
            state.selectedPeriodMenuItem = periodMenuItem;
            if (periodMenuItem === 'custom') state.customRangeModalVisible = true;
            else setPeriod(PERIOD_MENU_LIST[periodMenuItem]);
        };
        const handleCustomRangeModalConfirm = (period: Period) => {
            setPeriod(period);
            state.customRangeModalVisible = false;
        };

        const setPeriodMenuItemWithPeriod = (period?: Period) => {
            const start = dayjs.utc(period?.start).format('YYYY-MM-DD');
            const end = dayjs.utc(period?.end).format('YYYY-MM-DD');
            let selectedMenuItem = 'custom';
            Object.entries(PERIOD_MENU_LIST).forEach(([key, value]) => {
                if (start === value.start && end === value.end) {
                    selectedMenuItem = key;
                }
            });
            state.selectedPeriodMenuItem = selectedMenuItem;
        };

        watch(() => state.period, (period) => {
            if (period) {
                setPeriodMenuItemWithPeriod(period);
            }
        });

        return {
            ...toRefs(state),
            handleSelectPeriodMenuItem,
            handleCustomRangeModalConfirm,
            dateFormatter,
            DATA_TYPE,
        };
    },
};
</script>
<style lang="postcss" scoped>
.cost-analysis-period-select-dropdown {
    .p-badge {
        margin-right: 0.5rem;
        .text {
            white-space: nowrap;
        }
    }
    &.responsive {
        @screen mobile {
            @apply flex flex-wrap justify-end items-center;
            width: 100%;
        }
    }
}

</style>
