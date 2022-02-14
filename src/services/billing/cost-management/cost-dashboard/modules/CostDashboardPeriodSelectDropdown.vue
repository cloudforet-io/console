<template>
    <div class="cost-dashboard-period-select-dropdown">
        <div class="fix-date-box">
            <p-check-box :selected="isFixedTypeSelected" @change="handleSelectedFixDate">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FIX_DATE') }}
            </p-check-box>
            <p-tooltip class="fix-date-tooltip" :contents="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FIXED_DATE_TOOLTIP')"
                       :position="'bottom'"
            >
                <p-i name="ic_tooltip" width="1rem" height="1rem" />
            </p-tooltip>
        </div>
        <p-badge style-type="gray200">
            <p v-if="dateFormatter(selectedPeriod.start, 'M') !== dateFormatter(selectedPeriod.end, 'M')">
                {{ dateFormatter(selectedPeriod.start, 'MMMM D') }}, {{ dateFormatter(selectedPeriod.start, 'YYYY') }}
                ~ {{ dateFormatter(selectedPeriod.end, 'MMMM D') }}, {{ dateFormatter(selectedPeriod.end, 'YYYY') }}
            </p>
            <p v-else>
                {{ dateFormatter(selectedPeriod.start, 'MMMM D') }} ~ {{ dateFormatter(selectedPeriod.end, 'D') }}, {{ dateFormatter(period.end, 'YYYY') }}
            </p>
        </p-badge>
        <p-select-dropdown :items="MonthMenuItems"
                           :selected="selectedMonthMenuItem"
                           without-outline
                           :disabled="isFixedTypeSelected"
                           @select="handleSelectMonthMenuItem"
        />
        <cost-management-custom-range-modal v-if="customRangeModalVisible"
                                            :visible.sync="customRangeModalVisible"
                                            :datetime-picker-data-type="DATA_TYPE.yearToMonth"
                                            :granularity="GRANULARITY.MONTHLY"
                                            @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { range } from 'lodash';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import dayjs from 'dayjs';
import { Period } from '@/services/billing/cost-management/type';
import {
    PBadge, PSelectDropdown, PCheckBox, PI, PTooltip,
} from '@spaceone/design-system';
import CostManagementCustomRangeModal
    from '@/services/billing/cost-management/modules/CostManagementCustomRangeModal.vue';
import { i18n } from '@/translations';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

const yesterday = dayjs.utc().subtract(1, 'day');
const initialPeriodStart = yesterday.startOf('month').format('YYYY-MM-DD');
const initialPeriodEnd = yesterday.endOf('month').format('YYYY-MM-DD');
const initialSelectedMonth = initialPeriodStart.substr(0, 7);

export default {
    name: 'CostDashboardPeriodSelectDropdown',
    components: {
        CostManagementCustomRangeModal,
        PSelectDropdown,
        PBadge,
        PCheckBox,
        PI,
        PTooltip,
    },
    props: {
        periodType: {
            type: String,
            default: '',
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        dashboardId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();

        const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);

        const state = reactive({
            selectedPeriod: {
                start: props.periodType === 'FIXED' ? dayjs(props.period.start).format('YYYY-MM')
                    : initialPeriodStart,
                end: props.periodType === 'FIXED' ? dayjs(props.period.end).endOf('month').format('YYYY-MM-DD')
                    : initialPeriodEnd,
            },
            getMonthMenuItem: computed(() => {
                const monthData: MenuItem[] = [];
                range(12).forEach((i) => {
                    monthData.push({
                        type: 'item',
                        label: i18nDayjs.value(yesterday.format('YYYY-MM-DD')).subtract(i, 'month').format('MMMM YYYY'),
                        name: yesterday.subtract(i, 'month').format('YYYY-MM'),
                    });
                });
                return monthData.reverse();
            }),
            MonthMenuItems: computed<MenuItem[]>(() => ([
                ...state.getMonthMenuItem.reverse(),
                {
                    type: 'divider',
                },
                {
                    type: 'item',
                    name: 'custom',
                    label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOM'),
                },
            ])),
            isFixedTypeSelected: props.periodType === 'FIXED',
            selectedMonthMenuItem: initialSelectedMonth,
            customRangeModalVisible: false,
            isCustomPeriod: computed<boolean>(() => {
                const period = state.selectedPeriod;
                return dayjs(period.start).format('YYYY-MM') !== dayjs(period.end).format('YYYY-MM');
            }),
        });
        const setSelectedPeriod = (start, end) => {
            const _start = dayjs(start).startOf('month').format('YYYY-MM-DD');
            const _end = dayjs(end).endOf('month').format('YYYY-MM-DD');
            state.selectedPeriod = { start: _start, end: _end };
        };
        const handleSelectMonthMenuItem = (monthMenuItem) => {
            state.selectedMonthMenuItem = monthMenuItem;
            if (monthMenuItem === 'custom') state.customRangeModalVisible = true;
            else {
                setSelectedPeriod(monthMenuItem, monthMenuItem);
                emit('update:period', state.selectedPeriod);
            }
        };
        const handleCustomRangeModalConfirm = (period: Period) => {
            const { start, end } = period;
            setSelectedPeriod(start, end);
            emit('update:period', state.selectedPeriod);
            state.customRangeModalVisible = false;
        };

        const handleSelectedFixDate = async (isSelected: boolean) => {
            try {
                const periodType = isSelected ? 'FIXED' : 'AUTO';
                const period = isSelected ? state.selectedPeriod : {};
                await SpaceConnector.client.costAnalysis.dashboard.update({
                    public_dashboard_id: props.dashboardId,
                    period_type: periodType,
                    period,
                });
                state.isFixedTypeSelected = isSelected;
                emit('update:periodType', periodType);
                emit('update:period', state.selectedPeriod);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        // handle dropdown menu item (custom or date(ex. August 2021))
        const initSelectedMonthItem = () => {
            const periodStart = state.selectedPeriod.start;
            if (periodStart) {
                if (state.isCustomPeriod) state.selectedMonthMenuItem = 'custom';
                else state.selectedMonthMenuItem = dayjs(periodStart).format('YYYY-MM');
            } else {
                state.selectedMonthMenuItem = initialSelectedMonth;
            }
        };

        const initStates = (isFixedType: boolean) => {
            state.isFixedTypeSelected = isFixedType;

            if (isFixedType && props.period?.start && props.period?.end) {
                // don't emit update:period event because selectedPeriod is set by props.period in this case.
                setSelectedPeriod(props.period.start, props.period.end);
            } else {
                setSelectedPeriod(initialPeriodStart, initialPeriodEnd);
                emit('update:period', state.selectedPeriod);
            }

            initSelectedMonthItem();
        };

        watch([() => props.period, () => props.periodType], ([period, periodType]) => {
            // check if this change is not caused by this component's update:period event.
            if (period === state.selectedPeriod) return;

            initStates(periodType === 'FIXED');
        });
        return {
            ...toRefs(state),
            handleSelectMonthMenuItem,
            handleCustomRangeModalConfirm,
            dateFormatter,
            DATA_TYPE,
            GRANULARITY,
            handleSelectedFixDate,
        };
    },
};
</script>
<style lang="postcss" scoped>
.cost-dashboard-period-select-dropdown {
    .fix-date-box {
        @apply inline-flex flex-wrap gap-2 items-center;
        margin-right: 0.5rem;
    }
}
.p-badge {
    margin-right: 0.5rem;
}

@screen mobile {
    .cost-dashboard-period-select-dropdown {
        @apply flex flex-wrap justify-end items-center;
        width: 100%;
    }
}
</style>
