<script lang="ts" setup>


import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';
import { range } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { useProxyValue } from '@/common/composables/proxy-state';

const { i18nDayjs } = useI18nDayjs();

interface Props {
    selectedYear: string;
    selectedMonth: string;
}

const props = withDefaults(defineProps<Props>(), {
    selectedYear: '',
    selectedMonth: '',
});
const emit = defineEmits<{(e: 'update:selectedYear'): void;
    (e: 'update:selectedMonth'): void;
}>();
const { t } = useI18n();

const state = reactive({
    proxySelectedYear: useProxyValue('selectedYear', props, emit),
    proxySelectedMonth: useProxyValue('selectedMonth', props, emit),
    yearMenuItems: computed<SelectDropdownMenu[]>(() => {
        const currYear = dayjs.utc();
        const menuItems: SelectDropdownMenu[] = [];
        range(4).forEach((i) => {
            const date = currYear.subtract(i, 'year').format('YYYY');
            menuItems.push({ name: date, label: date });
        });
        return menuItems;
    }),
    monthMenuItems: computed<SelectDropdownMenu[]>(() => {
        const months = i18nDayjs.value.months();
        const menuItems = [
            { name: 'all', label: t('INVENTORY.CLOUD_SERVICE.HISTORY.ALL_MONTH') },
        ];
        months.forEach((month, idx) => {
            menuItems.push({
                name: `${idx + 1}`, label: month,
            });
        });
        return menuItems;
    }),
});

</script>

<template>
    <div>
        <p-select-dropdown v-model="state.proxySelectedMonth"
                           class="month-select-dropdown"
                           :items="state.monthMenuItems"
        />
        <p-select-dropdown v-model="state.proxySelectedYear"
                           class="year-select-dropdown"
                           :items="state.yearMenuItems"
        />
    </div>
</template>

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
