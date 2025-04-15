<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { cloneDeep, range } from 'lodash';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DateRange, DashboardOptions } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import { useDashboardManageable } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-manageable';
import DashboardToolsetDateCustomModal
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardToolsetDateCustomModal.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';

interface Props {
    dateRange?: DateRange;
    widgetMode?: boolean; // NOTE: this for widget mode (temporary)
}
const props = withDefaults(defineProps<Props>(), {
    dateRange: undefined,
});

const { i18nDayjs } = useI18nDayjs();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);

/* Query */
const {
    dashboard,
    fetcher,
    keys,
} = useDashboardGetQuery({
    dashboardId,
});
const queryClient = useQueryClient();
const { getDashboardManageable } = useDashboardManageable();
const dashboardManageable = computed(() => getDashboardManageable(dashboard.value));
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
                label: `${i18n.t('DASHBOARDS.DETAIL.CURRENT_MONTH')} (${dayjs.utc().format('YYYY-MM')})`,
            },
            ...monthData,
            { type: 'divider' },
            {
                type: 'item',
                name: 'custom',
                label: i18n.t('DASHBOARDS.DETAIL.OTHER_MONTHS'),
            },
        ];
    }),
    selectedMonthMenuItem: {} as MenuItem,
    selectedMonthLabel: computed(() => {
        if (state.selectedMonthMenuItem?.name === 'custom' && (state.selectedDateRange?.start || state.selectedDateRange?.end)) {
            return i18nDayjs.value.utc(dayjs.utc(state.selectedDateRange?.start).format('YYYY-MM')).format('MMMM YYYY');
        }
        return state.selectedMonthMenuItem?.name;
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
const updateDashboardDateRange = (dateRange: DashboardOptions['date_range']) => {
    const _options = cloneDeep(dashboardDetailState.options);
    _options.date_range.start = dateRange.start;
    _options.date_range.end = dateRange.end;
    dashboardDetailStore.setOptions(_options);
};

/* Event */
const handleSelectMonthMenuItem = (selected: string) => {
    if (selected === 'custom') {
        state.customRangeModalVisible = true;
        return;
    }

    state.selectedMonthMenuItem = state.monthMenuItems.find((d) => d.name === selected);
    if (selected === 'current') {
        state.selectedDateRange = { start: undefined, end: undefined };
        updateDashboardDateRange(state.selectedDateRange);
    } else {
        setSelectedDateRange(state.selectedMonthMenuItem.name, state.selectedMonthMenuItem.name);
        updateDashboardDateRange(state.selectedDateRange);
    }

    if (dashboardManageable.value && !props.widgetMode) {
        mutate({
            dashboard_id: dashboardId.value,
            options: {
                ...(dashboard.value?.options || {}),
                date_range: state.selectedDateRange,
            },
        });
    }
};
const handleCustomRangeModalConfirm = (dateRange: DateRange) => {
    const { start, end } = dateRange;
    setSelectedDateRange(start, end);
    updateDashboardDateRange(state.selectedDateRange);
    state.selectedMonthMenuItem = state.monthMenuItems[state.monthMenuItems.length - 1];
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

const { mutate } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: PublicDashboardModel|PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey.value });
        },
    },
);

watch(() => props.dateRange, () => {
    state.selectedMonthMenuItem = state.monthMenuItems[setInitialDateRange()];
}, { immediate: true });
</script>

<template>
    <div :class="{'dashboard-date-dropdown': true, 'detail-page': !props.widgetMode}">
        <span v-if="!props.widgetMode"
              class="label-text"
        >
            {{ $t('DASHBOARDS.DETAIL.BASED_ON') }}
        </span>
        <p-select-dropdown class="date-dropdown"
                           size="sm"
                           :menu="state.monthMenuItems"
                           :selected="state.selectedMonthMenuItem.name"
                           reset-selection-on-menu-close
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

    &.detail-page {
        .label-text {
            @apply text-label-md font-bold text-gray-800;
            padding-right: 0.25rem;
        }
    }
}
</style>
