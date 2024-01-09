<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { cloneDeep, range } from 'lodash';

import type { DateRange, DashboardSettings } from '@/schema/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import DashboardToolsetDateCustomModal from '@/services/dashboards/components/DashboardToolsetDateCustomModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dateRange?: DateRange;
}
const props = withDefaults(defineProps<Props>(), {
    dateRange: undefined,
});

const { i18nDayjs } = useI18nDayjs();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    monthMenuItems: computed<MenuItem[]>(() => {
        const monthData: MenuItem[] = [];
        range(12).forEach((i) => {
            monthData.push({
                type: 'item',
                label: i18nDayjs.value.utc(dayjs.utc().format('YYYY-MM')).subtract(i, 'month').format('MMMM YYYY'),
                name: dayjs.utc().subtract(i, 'month').format('YYYY-MM'),
            });
        });

        return [
            {
                type: 'item',
                name: 'current',
                label: i18n.t('DASHBOARDS.DETAIL.CURRENT_MONTH'),
            },
            ...monthData,
            { type: 'divider' },
            {
                type: 'item',
                name: 'custom',
                label: i18n.t('DASHBOARDS.DETAIL.CUSTOM'),
            },
        ];
    }),
    selectedMonthMenu: null,
    selectedMonthLabel: computed(() => {
        if (state.selectedMonthMenu?.name === 'custom' && (state.selectedDateRange?.start || state.selectedDateRange?.end)) {
            return i18nDayjs.value.utc(dayjs.utc(state.selectedDateRange?.start).format('YYYY-MM')).format('MMMM YYYY');
        }
        return state.selectedMonthMenu?.name;
    }),
    selectedDateRange: {},
    customRangeModalVisible: false,
});

/* Util */
const setSelectedDateRange = (start, end) => {
    const _start = dayjs.utc(start).startOf('month').format('YYYY-MM');
    const _end = dayjs.utc(end).endOf('month').format('YYYY-MM');
    state.selectedDateRange = { start: _start, end: _end };
};
const updateDashboardDateRange = (dateRange: DashboardSettings['date_range']) => {
    const _settings = cloneDeep(dashboardDetailState.settings);
    _settings.date_range.start = dateRange.start;
    _settings.date_range.end = dateRange.end;
    dashboardDetailStore.setSettings(_settings);
};

/* Event */
const handleSelectMonthMenuItem = (selected: string) => {
    state.selectedMonthMenu = state.monthMenuItems.find((d) => d.name === selected);
    if (state.selectedMonthMenu.name === 'current') {
        state.selectedDateRange = { start: undefined, end: undefined };
        updateDashboardDateRange(state.selectedDateRange);
    } else if (state.selectedMonthMenu.name === 'custom') state.customRangeModalVisible = true;
    else {
        setSelectedDateRange(state.selectedMonthMenu.name, state.selectedMonthMenu.name);
        updateDashboardDateRange(state.selectedDateRange);
    }
};
const handleCustomRangeModalConfirm = (dateRange: DateRange) => {
    const { start, end } = dateRange;
    setSelectedDateRange(start, end);
    updateDashboardDateRange(state.selectedDateRange);
    state.selectedMonthMenu = state.monthMenuItems[state.monthMenuItems.length - 1];
    state.customRangeModalVisible = false;
};

const setInitialDateRange = () => {
    const _start = dayjs.utc(props.dateRange?.start);
    const _end = dayjs.utc(props.dateRange?.end);


    // 1. default month => dateRange.start is undefined or dateRange.end is undefined
    // Index 0 is 'Current' menu index
    if (!props.dateRange?.start
                || !props.dateRange?.end
    ) {
        return 0;
    }

    // 2. some month => start is (month 'n' + day '1'), end is (month 'n' + day '{last day}')
    if (_start.isSame(_end, 'month')
                && _start.isSame(_start, 'month')
                && _end.isSame(_end, 'month')
    ) {
        const itemIndex = state.monthMenuItems.findIndex((d) => d.name === _start.format('YYYY-MM'));
        if (itemIndex > -1) return itemIndex;
    }

    // 3. custom => else cases.
    // The Last index is 'Custom' menu index.
    return state.monthMenuItems.length - 1;
};

watch(() => props.dateRange, () => {
    state.selectedMonthMenu = state.monthMenuItems[setInitialDateRange()];
}, { immediate: true });
</script>

<template>
    <div class="dashboard-date-dropdown">
        <p-select-dropdown
            :menu="state.monthMenuItems"
            :selection-label="$t('DASHBOARDS.DETAIL.PERIOD')"
            style-type="rounded"
            :selected="state.selectedMonthLabel"
            menu-position="right"
            @select="handleSelectMonthMenuItem"
        >
            <template #menu-item--format="{ item }">
                <span>{{ item.label }}</span>
            </template>
        </p-select-dropdown>
        <dashboard-toolset-date-custom-modal :visible.sync="state.customRangeModalVisible"
                                             granularity="MONTHLY"
                                             :selected-date-range="dateRange"
                                             @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-date-dropdown {
    @apply flex items-center justify-center;
    min-height: 2rem;
}
</style>
