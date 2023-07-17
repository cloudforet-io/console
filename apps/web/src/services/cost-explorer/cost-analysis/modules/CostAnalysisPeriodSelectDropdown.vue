<template>
    <div class="cost-analysis-period-select-dropdown"
         :class="{responsive: !printMode}"
    >
        <p-badge style-type="gray200"
                 badge-type="subtle"
        >
            <p class="text">
                {{ periodText }}
            </p>
        </p-badge>
        <p-select-dropdown v-if="!printMode"
                           :items="periodMenuItems"
                           :selected="selectedPeriod"
                           style-type="transparent"
                           @select="handleSelectPeriod"
        />
        <custom-date-range-modal :visible.sync="customRangeModalVisible"
                                 :granularity="costAnalysisPageState.granularity"
                                 :selected-date-range="period"
                                 @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Period, Granularity } from '@/services/cost-explorer/type';
import CustomDateRangeModal from '@/services/dashboards/widgets/_components/CustomDateRangeModal.vue';


const today = dayjs.utc();
interface PeriodItem {
    name: string;
    label: TranslateResult;
    start: Dayjs;
    end: Dayjs;
    enabled: Granularity[];
}

export default {
    name: 'CostAnalysisPeriodSelectDropdown',
    components: {
        CustomDateRangeModal,
        PSelectDropdown,
        PBadge,
    },
    props: {
        fixedPeriod: {
            type: Object,
            default: () => (getInitialDates()),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const costAnalysisPageStore = useCostAnalysisPageStore();
        const costAnalysisPageState = costAnalysisPageStore.$state;

        const { i18nDayjs } = useI18nDayjs();
        const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);
        const state = reactive({
            period: computed<Period>({
                get() { return props.fixedPeriod; },
                set(period) {
                    costAnalysisPageStore.$patch((_state) => {
                        _state.period = period;
                    });
                },
            }),
            periodItems: computed<PeriodItem[]>(() => ([
                {
                    name: 'last7days',
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_7_DAYS'),
                    start: today.subtract(6, 'day'),
                    end: today,
                    enabled: [GRANULARITY.DAILY, GRANULARITY.ACCUMULATED],
                },
                {
                    name: 'last14days',
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_14_DAYS'),
                    start: today.subtract(13, 'day'),
                    end: today,
                    enabled: [GRANULARITY.DAILY, GRANULARITY.ACCUMULATED],
                },
                {
                    name: 'thisMonth',
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.THIS_MONTH'),
                    start: today.startOf('month'),
                    end: today.endOf('month'),
                    enabled: [GRANULARITY.DAILY, GRANULARITY.MONTHLY, GRANULARITY.ACCUMULATED],
                },
                {
                    name: 'lastMonth',
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_MONTH'),
                    start: today.subtract(1, 'month').startOf('month'),
                    end: today.subtract(1, 'month').endOf('month'),
                    enabled: [GRANULARITY.DAILY, GRANULARITY.MONTHLY, GRANULARITY.ACCUMULATED],
                },
                {
                    name: 'last3Month',
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_3_MONTHS'),
                    start: today.subtract(2, 'month').startOf('month'),
                    end: today.endOf('month'),
                    enabled: [GRANULARITY.MONTHLY, GRANULARITY.ACCUMULATED],
                },
                {
                    name: 'last6Month',
                    label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PERIOD.LAST_6_MONTHS'),
                    start: today.subtract(5, 'month').startOf('month'),
                    end: today.endOf('month'),
                    enabled: [GRANULARITY.MONTHLY, GRANULARITY.ACCUMULATED],
                },
            ])),
            periodMenuItems: computed<MenuItem[]>(() => {
                const menuItems = state.periodItems.filter((d) => d.enabled.includes(costAnalysisPageState.granularity));
                return [
                    ...menuItems,
                    {
                        type: 'divider',
                    },
                    {
                        type: 'item',
                        name: 'custom',
                        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOM'),
                    },
                ];
            }),
            selectedPeriod: 'thisMonth',
            customRangeModalVisible: false,
            periodText: computed(() => {
                const isSameMonth: boolean = dateFormatter(state.period.start, 'M') === dateFormatter(state.period.end, 'M');
                const start = state.period.start;
                const end = state.period.end;
                if (isSameMonth) {
                    return `${dateFormatter(start, 'MMMM D')} ~ ${dateFormatter(end, 'D')}, ${dateFormatter(end, 'YYYY')}`;
                }
                if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) {
                    return `${dateFormatter(start, 'MMMM')}, ${dateFormatter(start, 'YYYY')} ~ ${dateFormatter(end, 'MMMM')}, ${dateFormatter(end, 'YYYY')}`;
                }
                return `${dateFormatter(start, 'MMMM D')}, ${dateFormatter(start, 'YYYY')} ~ ${dateFormatter(end, 'MMMM D')}, ${dateFormatter(end, 'YYYY')}`;
            }),
        });

        /* Util */
        const setPeriod = (period: Period) => {
            state.period = period;
            emit('update', period);
        };
        const setPeriodMenuItemWithPeriod = (period?: Period) => {
            const start = dayjs.utc(period?.start);
            const end = dayjs.utc(period?.end);
            let selectedMenu = 'custom';
            const unit = GRANULARITY.DAILY ? 'day' : 'month';
            state.periodItems.forEach((d) => {
                if (start.isSame(d.start, unit) && end.isSame(d.end, unit)) {
                    selectedMenu = d.name;
                }
            });
            state.selectedPeriod = selectedMenu;
        };

        /* Event */
        const handleSelectPeriod = (periodMenuName) => {
            state.selectedPeriod = periodMenuName;
            if (periodMenuName === 'custom') state.customRangeModalVisible = true;
            else {
                const selectedPeriodItem: PeriodItem = state.periodItems.find((d) => d.name === periodMenuName);
                setPeriod({
                    start: selectedPeriodItem.start.format(),
                    end: selectedPeriodItem.end.format(),
                });
            }
        };
        const handleCustomRangeModalConfirm = (period: Period) => {
            setPeriod(period);
            state.customRangeModalVisible = false;
        };

        /* Watcher */
        watch(() => state.period, (period) => {
            if (period) {
                setPeriodMenuItemWithPeriod(period);
            }
        });

        return {
            ...toRefs(state),
            costAnalysisPageState,
            handleSelectPeriod,
            handleCustomRangeModalConfirm,
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
