<template>
    <div class="cost-dashboard-period-select-dropdown">
        <p-badge style-type="gray200">
            <p v-if="dateFormatter(period.start, 'M') !== dateFormatter(period.end, 'M')">
                {{ dateFormatter(period.start, 'MMMM D') }}, {{ dateFormatter(period.start, 'YYYY') }}
                ~ {{ dateFormatter(period.end, 'MMMM D') }}, {{ dateFormatter(period.end, 'YYYY') }}
            </p>
            <p v-else>
                {{ dateFormatter(period.start, 'MMMM D') }} ~ {{ dateFormatter(period.end, 'D') }}, {{ dateFormatter(period.end, 'YYYY') }}
            </p>
        </p-badge>
        <p-select-dropdown :items="MonthMenuItems"
                           :selected="selectedMonthMenuItem"
                           without-outline
                           :disabled="Object.keys(fixedPeriod).length > 0"
                           @select="handleSelectMonthMenuItem"
        />
        <cost-management-custom-range-modal v-if="customRangeModalVisible"
                                            :visible.sync="customRangeModalVisible"
                                            :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CUSTOM_RANGE')"
                                            :datetime-picker-data-type="DATA_TYPE.yearToMonth"
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
import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import CostManagementCustomRangeModal
    from '@/services/billing/cost-management/modules/CostManagementCustomRangeModal.vue';
import { i18n } from '@/translations';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';

const yesterday = dayjs.utc().subtract(1, 'day');

export default {
    name: 'CostDashboardPeriodSelectDropdown',
    components: {
        CostManagementCustomRangeModal,
        PSelectDropdown,
        PBadge,
    },
    props: {
        fixedPeriod: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();

        const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);

        const state = reactive({
            period: {
                start: props.fixedPeriod ? dayjs(props.fixedPeriod.start).format('YYYY-MM')
                    : yesterday.startOf('month').format('YYYY-MM-DD'),
                end: props.fixedPeriod ? dayjs(props.fixedPeriod.end).endOf('month').format('YYYY-MM-DD')
                    : yesterday.endOf('month').format('YYYY-MM-DD'),
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
            selectedMonthMenuItem: undefined,
            customRangeModalVisible: false,
        });
        const savePeriod = (start, end) => {
            const _start = dayjs(start).startOf('month').format('YYYY-MM-DD');
            const _end = dayjs(end).endOf('month').format('YYYY-MM-DD');
            state.period = { start: _start, end: _end };
            emit('update', state.period);
        };
        const handleSelectMonthMenuItem = (monthMenuItem) => {
            state.selectedMonthMenuItem = monthMenuItem;
            if (monthMenuItem === 'custom') state.customRangeModalVisible = true;
            else savePeriod(monthMenuItem, monthMenuItem);
        };
        const handleCustomRangeModalConfirm = (period: Period) => {
            const { start, end } = period;
            savePeriod(start, end);
            state.customRangeModalVisible = false;
        };

        watch(() => props.fixedPeriod, () => {
            if (props.fixedPeriod?.start) {
                savePeriod(props.fixedPeriod.start, props.fixedPeriod.end);
                state.selectedMonthMenuItem = 'custom';
            } else savePeriod(state.period.start, state.period.end);
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleSelectMonthMenuItem,
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
    .cost-dashboard-period-select-dropdown {
        @apply flex flex-wrap justify-end items-center;
        width: 100%;
    }
}
</style>
