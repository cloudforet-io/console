<template>
    <div class="cost-dashboard-period-select-dropdown">
        <div v-if="!printMode"
             class="fix-date-box"
        >
            <p-checkbox :selected="isFixedTypeSelected"
                        :disabled="disableFixDate"
                        @change="handleSelectedFixDate"
            >
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FIX_DATE') }}
            </p-checkbox>
            <p-tooltip class="fix-date-tooltip"
                       :contents="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FIXED_DATE_TOOLTIP')"
                       :position="'bottom'"
            >
                <p-i name="ic_question-mark-circle-filled"
                     width="1rem"
                     height="1rem"
                />
            </p-tooltip>
        </div>
        <p-badge style-type="gray200"
                 badge-type="subtle"
        >
            <p v-if="dateFormatter(selectedPeriod.start, 'M') !== dateFormatter(selectedPeriod.end, 'M')">
                {{ dateFormatter(selectedPeriod.start, 'MMMM D') }}, {{ dateFormatter(selectedPeriod.start, 'YYYY') }}
                ~ {{ dateFormatter(selectedPeriod.end, 'MMMM D') }}, {{ dateFormatter(selectedPeriod.end, 'YYYY') }}
            </p>
            <p v-else>
                {{ dateFormatter(selectedPeriod.start, 'MMMM D') }} ~ {{ dateFormatter(selectedPeriod.end, 'D') }}, {{ dateFormatter(period.end, 'YYYY') }}
            </p>
        </p-badge>
        <p-select-dropdown v-if="!printMode"
                           :items="MonthMenuItems"
                           :selected="selectedMonthMenuItem"
                           style-type="transparent"
                           :disabled="isFixedTypeSelected"
                           :read-only="printMode"
                           @select="handleSelectMonthMenuItem"
        />
        <custom-date-range-modal :selected-date-range="selectedPeriod"
                                 :visible.sync="customRangeModalVisible"
                                 datetime-picker-data-type="yearToMonth"
                                 :granularity="GRANULARITY.MONTHLY"
                                 @confirm="handleCustomRangeModalConfirm"
        />
        <currency-select-dropdown :class="{ 'left-divider': printMode }"
                                  :print-mode="printMode"
        />
    </div>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PBadge, PSelectDropdown, PCheckbox, PI, PTooltip,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import CurrencySelectDropdown from '@/common/modules/dropdown/currency-select-dropdown/CurrencySelectDropdown.vue';

import { DASHBOARD_TYPE } from '@/services/cost-explorer/cost-dashboard/lib/config';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Period } from '@/services/cost-explorer/type';
import CustomDateRangeModal from '@/services/dashboards/widgets/_components/CustomDateRangeModal.vue';

const initialPeriodStart = dayjs.utc().startOf('month').format('YYYY-MM-DD');
const initialPeriodEnd = dayjs.utc().endOf('month').format('YYYY-MM-DD');
const initialSelectedMonth = initialPeriodStart.substr(0, 7);

export default {
    name: 'CostDashboardPeriodSelectDropdown',
    components: {
        CustomDateRangeModal,
        CurrencySelectDropdown,
        PSelectDropdown,
        PBadge,
        PCheckbox,
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
        printMode: {
            type: Boolean,
            default: false,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();

        const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);

        const state = reactive({
            selectedPeriod: {
                start: props.printMode || props.periodType === 'FIXED' ? dayjs.utc(props.period.start).format('YYYY-MM')
                    : initialPeriodStart,
                end: props.printMode || props.periodType === 'FIXED' ? dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD')
                    : initialPeriodEnd,
            },
            getMonthMenuItem: computed(() => {
                const monthData: MenuItem[] = [];
                range(12).forEach((i) => {
                    monthData.push({
                        type: 'item',
                        label: i18nDayjs.value.utc(dayjs.utc().format('YYYY-MM-DD')).subtract(i, 'month').format('MMMM YYYY'),
                        name: dayjs.utc().subtract(i, 'month').format('YYYY-MM'),
                    });
                });
                return monthData;
            }),
            MonthMenuItems: computed<MenuItem[]>(() => ([
                ...state.getMonthMenuItem,
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
            isUserDashboard: computed(() => (props.dashboardId?.startsWith(DASHBOARD_TYPE.USER))),
            disableFixDate: computed(() => !state.isUserDashboard && props.manageDisabled),
            selectedMonthMenuItem: initialSelectedMonth,
            customRangeModalVisible: false,
            isCustomPeriod: computed<boolean>(() => {
                const period = state.selectedPeriod;
                return dayjs.utc(period.start).format('YYYY-MM') !== dayjs.utc(period.end).format('YYYY-MM');
            }),
        });
        const setSelectedPeriod = (start, end) => {
            const _start = dayjs.utc(start).startOf('month').format('YYYY-MM-DD');
            const _end = dayjs.utc(end).endOf('month').format('YYYY-MM-DD');
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

        const updatePublicDashboardPeriod = async (periodType, period) => {
            try {
                await SpaceConnector.client.costAnalysis.publicDashboard.update({
                    public_dashboard_id: props.dashboardId,
                    period_type: periodType,
                    period,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const updateUserDashboardPeriod = async (periodType, period) => {
            try {
                await SpaceConnector.client.costAnalysis.userDashboard.update({
                    user_dashboard_id: props.dashboardId,
                    period_type: periodType,
                    period,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleSelectedFixDate = async (isSelected: boolean) => {
            try {
                const periodType = isSelected ? 'FIXED' : 'AUTO';
                const period = isSelected ? state.selectedPeriod : {};

                if (props.dashboardId?.startsWith('user')) {
                    await updateUserDashboardPeriod(periodType, period);
                } else {
                    await updatePublicDashboardPeriod(periodType, period);
                }

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
                else state.selectedMonthMenuItem = dayjs.utc(periodStart).format('YYYY-MM');
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

            if (!props.printMode) initSelectedMonthItem();
        };

        watch([() => props.period, () => props.periodType], ([period, periodType]) => {
            // check if this change is not caused by this component's update:period event.
            if (period === state.selectedPeriod) return;

            initStates(props.printMode || periodType === 'FIXED');
        }, { immediate: true });
        return {
            ...toRefs(state),
            handleSelectMonthMenuItem,
            handleCustomRangeModalConfirm,
            dateFormatter,
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
    .left-divider {
        @apply relative;
        padding-left: 0.5rem;
        margin-left: 0.5rem;
        &::before {
            @apply bg-gray-300;
            position: absolute;
            top: 50%;
            left: 0;
            display: inline-block;
            width: 0.0625rem;
            height: 1.25rem;
            content: ' ';
            margin-top: calc(-1.25rem / 2);
        }
    }
}

/* custom design-system component - p-badge */
:deep(.p-badge) {
    margin-right: 0.5rem;
    > p {
        white-space: nowrap;
    }
}

@screen mobile {
    .cost-dashboard-period-select-dropdown {
        @apply flex flex-wrap justify-end items-center;
        width: 100%;
    }
}
</style>
