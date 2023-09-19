<template>
    <div class="dashboard-date-dropdown">
        <p-select-dropdown
            :menu="state.monthMenuItems"
            :selected="state.selectedMonthMenuIndex"
            index-mode
            menu-position="right"
            @select="handleSelectMonthMenuItem"
        >
            <span>{{ state.selectedMonthLabel }}</span>
            <template #menu-item--format="{ item }">
                <span>{{ item.label }}</span>
            </template>
        </p-select-dropdown>
        <dashboard-custom-date-range-modal v-model:visible="state.customRangeModalVisible"
                                           granularity="MONTHLY"
                                           :selected-date-range="props.dateRange"
                                           @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts" setup>
import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { range } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { DateRange } from '@/services/dashboards/config';
import DashboardCustomDateRangeModal from '@/services/dashboards/shared/DashboardCustomDateRangeModal.vue';

interface Props {
    dateRange?: DateRange;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:date-range', value: DateRange): void}>();
const { t } = useI18n();

const { i18nDayjs } = useI18nDayjs();
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
                label: t('DASHBOARDS.DETAIL.CURRENT_MONTH'),
            },
            ...monthData,
            { type: 'divider' },
            {
                type: 'item',
                name: 'custom',
                label: t('DASHBOARDS.DETAIL.CUSTOM'),
            },
        ];
    }),
    selectedMonthLabel: computed(() => {
        if (state.monthMenuItems[state.selectedMonthMenuIndex]?.name === 'custom') {
            return i18nDayjs.value.utc(dayjs.utc(state.selectedDateRange?.start).format('YYYY-MM-DD')).format('MMMM YYYY');
        }
        return state.monthMenuItems[state.selectedMonthMenuIndex]?.label;
    }),
    selectedDateRange: {},
    selectedMonthMenuIndex: 0,
    customRangeModalVisible: false,
});

const setSelectedDateRange = (start, end) => {
    const _start = dayjs.utc(start).startOf('month').format('YYYY-MM');
    const _end = dayjs.utc(end).endOf('month').format('YYYY-MM');
    state.selectedDateRange = { start: _start, end: _end };
};

const handleSelectMonthMenuItem = (selectedIndex: number) => {
    state.selectedMonthMenuIndex = selectedIndex;
    if (state.monthMenuItems[selectedIndex].name === 'current') {
        state.selectedDateRange = { start: undefined, end: undefined };
        emit('update:date-range', state.selectedDateRange);
    } else if (state.monthMenuItems[selectedIndex].name === 'custom') state.customRangeModalVisible = true;
    else {
        setSelectedDateRange(state.monthMenuItems[selectedIndex].name, state.monthMenuItems[selectedIndex].name);
        emit('update:date-range', state.selectedDateRange);
    }
};
const handleCustomRangeModalConfirm = (dateRange: DateRange) => {
    const { start, end } = dateRange;
    setSelectedDateRange(start, end);
    emit('update:date-range', state.selectedDateRange);
    state.customRangeModalVisible = false;
};

const setInitialDateRange = () => {
    const _current = dayjs.utc();
    const _start = dayjs.utc(props.dateRange?.start);
    const _end = dayjs.utc(props.dateRange?.end);

    // 1. default month => start is (month 'current' + day '1'), end is (month 'current + day 'today')
    // Index 0 is 'Current' menu index
    if (!props.dateRange?.start
        || !props.dateRange?.end
        || (_start.isSame(_current, 'month')
            && _end.isSame(_current, 'month'))
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
    state.selectedMonthMenuIndex = setInitialDateRange();
}, { immediate: true });

</script>
<style lang="postcss" scoped>
.dashboard-date-dropdown {
    @apply relative flex items-center justify-center;
    min-height: 2rem;
}
</style>

<style lang="postcss" scoped>
.dashboard-date-dropdown {
    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        min-width: auto;
    }
}
</style>
