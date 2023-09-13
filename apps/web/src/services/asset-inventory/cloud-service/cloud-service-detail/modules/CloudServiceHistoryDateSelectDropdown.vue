<template>
    <div>
        <p-select-dropdown v-model="proxySelectedMonth"
                           class="month-select-dropdown"
                           :items="monthMenuItems"
        />
        <p-select-dropdown v-model="proxySelectedYear"
                           class="year-select-dropdown"
                           :items="yearMenuItems"
        />
    </div>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { useProxyValue } from '@/common/composables/proxy-state';

const { i18nDayjs } = useI18nDayjs();

export default {
    name: 'CloudServiceHistoryDateSelectDropdown',
    components: {
        PSelectDropdown,
    },
    props: {
        selectedYear: {
            type: String,
            default: '',
        },
        selectedMonth: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxySelectedYear: useProxyValue('selectedYear', props, emit),
            proxySelectedMonth: useProxyValue('selectedMonth', props, emit),
            yearMenuItems: computed<SelectDropdownMenuItem[]>(() => {
                const currYear = dayjs.utc();
                const menuItems: SelectDropdownMenuItem[] = [];
                range(4).forEach((i) => {
                    const date = currYear.subtract(i, 'year').format('YYYY');
                    menuItems.push({ name: date, label: date });
                });
                return menuItems;
            }),
            monthMenuItems: computed<SelectDropdownMenuItem[]>(() => {
                const months = i18nDayjs.value.months();
                const menuItems = [
                    { name: 'all', label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.ALL_MONTH') },
                ];
                months.forEach((month, idx) => {
                    menuItems.push({
                        name: `${idx + 1}`, label: month,
                    });
                });
                return menuItems;
            }),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-select-dropdown */
:deep(.month-select-dropdown) {
    .dropdown-button {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.year-select-dropdown) {
    .dropdown-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 0;
    }
}
</style>
