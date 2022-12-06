<template>
    <p-select-dropdown
        style-type="transparent"
        :items="monthMenuItems"
        :selected="selectedMonthMenuIndex"
        index-mode
        @select="handleSelectMonthMenuItem"
    >
        <div>
            <span>{{ monthMenuItems[selectedMonthMenuIndex].label }}</span>
            <p-badge
                v-if="monthMenuItems[selectedMonthMenuIndex].badge"
                style-type="primary3"
                shape="round"
                class="ml-1"
            >
                {{ monthMenuItems[selectedMonthMenuIndex].badge }}
            </p-badge>
        </div>
        <template #menu-item--format="{ item }">
            <div>
                <span>{{ item.label }}</span>
                <p-badge
                    v-if="item.badge"
                    style-type="primary3"
                    shape="round"
                    class="ml-1"
                >
                    {{ item.badge }}
                </p-badge>
            </div>
        </template>
    </p-select-dropdown>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

export default defineComponent({
    name: 'DashboardDateDropdown',
    components: {
        PBadge,
        PSelectDropdown,
    },
    setup(props, { emit }: SetupContext) {
        const { i18nDayjs } = useI18nDayjs();

        const state = reactive({
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
            monthMenuItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: 'current',
                    // song-lang
                    label: 'Current month',
                    // song-lang
                    badge: 'Auto',
                },
                ...state.getMonthMenuItem,
                { type: 'divider' },
                {
                    type: 'item',
                    name: 'custom',
                    // song-lang
                    label: 'Custom',
                },
            ])),
            selectedMonthMenuIndex: 0,
        });

        const handleSelectMonthMenuItem = (selectedIndex: number) => {
            state.selectedMonthMenuIndex = selectedIndex;
            emit('select', state.monthMenuItems[selectedIndex].name);
        };

        return {
            ...toRefs(state),
            handleSelectMonthMenuItem,
        };
    },
});
</script>
