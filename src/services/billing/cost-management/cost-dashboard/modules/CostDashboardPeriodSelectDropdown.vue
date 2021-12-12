<template>
    <div class="date-filter">
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
                           @select="handleSelectMonthMenuItem"
        />
        <cost-dashboard-custom-range-modal v-if="customRangeModalVisible"
                                           :visible.sync="customRangeModalVisible"
                                           @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { range } from 'lodash';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import dayjs from 'dayjs';
import { Period } from '@/services/billing/cost-management/type';
import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import CostDashboardCustomRangeModal
    from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardCustomRangeModal.vue';

const yesterday = dayjs.utc().subtract(1, 'day');
const getMonthMenuItem = () => {
    const monthData: MenuItem[] = [];
    range(12).forEach((i) => {
        monthData.push({
            type: 'item',
            label: yesterday.subtract(i, 'month').format('MMMM YYYY'),
            name: yesterday.subtract(i, 'month').format('YYYY-MM'),
        });
    });
    return monthData.reverse();
};

const dateFormatter = (date: string, format: string) => dayjs.utc(date).format(format);

export default {
    name: 'CostDashboardPeriodSelectDropdown',
    components: {
        CostDashboardCustomRangeModal,
        PSelectDropdown,
        PBadge,
    },
    setup(_, { emit }) {
        const state = reactive({
            period: {
                start: yesterday.startOf('month').format('YYYY-MM-DD'),
                end: yesterday.endOf('month').format('YYYY-MM-DD'),
            },
            MonthMenuItems: computed<MenuItem[]>(() => ([
                ...getMonthMenuItem().reverse(),
                {
                    type: 'divider',
                },
                {
                    type: 'item',
                    name: 'custom',
                    label: 'Custom',
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

        const initPeriod = () => {
            emit('update', state.period);
        };

        initPeriod();

        return {
            ...toRefs(state),
            handleSelectMonthMenuItem,
            handleCustomRangeModalConfirm,
            dateFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-badge {
    margin-right: 0.5rem;
}

@screen mobile {
    .date-filter {
        @apply flex flex-wrap justify-end items-center;
        width: 100%;
    }
}
</style>
