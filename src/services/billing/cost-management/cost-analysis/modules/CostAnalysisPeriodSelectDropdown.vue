<template>
    <div class="cost-analysis-period-select-dropdown">
        <p-badge style-type="gray200">
            <p v-if="dateFormatter(period.start, 'M') !== dateFormatter(period.end, 'M')">
                {{ dateFormatter(period.start, 'MMMM D') }}, {{ dateFormatter(period.start, 'YYYY') }}
                ~ {{ dateFormatter(period.end, 'MMMM D') }}, {{ dateFormatter(period.end, 'YYYY') }}
            </p>
            <p v-else>
                {{ dateFormatter(period.start, 'MMMM D') }} ~ {{ dateFormatter(period.end, 'D') }}, {{ dateFormatter(period.end, 'YYYY') }}
            </p>
        </p-badge>
        <p-select-dropdown :items="periodMenuItems"
                           :selected="selectedPeriodMenuItem"
                           without-outline
                           @select="handleSelectPeriodMenuItem"
        />
        <cost-management-custom-range-modal v-if="customRangeModalVisible"
                                            :visible.sync="customRangeModalVisible"
                                            :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.CUSTOM_DATE_RANGE')"
                                            :datetime-picker-data-type="DATA_TYPE.yearToDate"
                                            @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import dayjs, { Dayjs } from 'dayjs';
import { Period } from '@/services/billing/cost-management/type';
import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import CostManagementCustomRangeModal
    from '@/services/billing/cost-management/modules/CostManagementCustomRangeModal.vue';
import { i18n } from '@/translations';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';
import { store } from '@/store';

const today = dayjs().utc();
const basicFormat = (date: Dayjs) => date.format('YYYY-MM-DD');
const subDate = (value: number, unit: string) => today.subtract(value, unit);
export const PERIOD_MENU_LIST = Object.freeze({
    last7days: { start: basicFormat(subDate(6, 'day')), end: basicFormat(today) },
    last14days: { start: basicFormat(subDate(14, 'day')), end: basicFormat(today) },
    thisMonth: { start: basicFormat(today.startOf('month')), end: basicFormat(today) },
    lastMonth: { start: basicFormat(subDate(1, 'month').startOf('month')), end: basicFormat(subDate(1, 'month').endOf('month')) },
    last3months: { start: basicFormat(subDate(2, 'month').startOf('month')), end: basicFormat(today) },
    last6months: { start: basicFormat(subDate(5, 'month').startOf('month')), end: basicFormat(today) },
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
    },
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();
        const state = reactive({
            period: computed({
                get() { return props.fixedPeriod; },
                set(period) { store.commit('service/costAnalysis/setPeriod', period); },
            }),
            quickSelectPeriodMenuItems: computed(() => [
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_7_DAYS'), name: 'last7days' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_14_DAYS'), name: 'last14days' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_MONTH'), name: 'thisMonth' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_MONTH'), name: 'lastMonth' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_MONTHS'), name: 'last3months' },
                { label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_6_MONTHS'), name: 'last6months' },
            ]),
            periodMenuItems: computed<MenuItem[]>(() => ([
                ...state.quickSelectPeriodMenuItems,
                {
                    type: 'divider',
                },
                {
                    type: 'item',
                    name: 'custom',
                    label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOM'),
                },

            ])),
            selectedPeriodMenuItem: undefined,
            customRangeModalVisible: false,
        });
        const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);

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
.p-badge {
    margin-right: 0.5rem;
}

@screen mobile {
    .cost-analysis-period-select-dropdown {
        @apply flex flex-wrap justify-end items-center;
        width: 100%;
    }
}
</style>
