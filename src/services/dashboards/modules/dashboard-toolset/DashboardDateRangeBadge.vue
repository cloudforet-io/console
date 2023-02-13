<template>
    <p-badge style-type="gray200"
             badge-type="subtle"
             class="dashboard-date-range-badge"
    >
        <p v-if="dateFormatter(state.dateRange.start, 'M') !== dateFormatter(state.dateRange.end, 'M')">
            {{ dateFormatter(state.dateRange.start, 'MMMM D') }}, {{ dateFormatter(state.dateRange.start, 'YYYY') }}
            ~ {{ dateFormatter(state.dateRange.end, 'MMMM D') }}, {{ dateFormatter(state.dateRange.end, 'YYYY') }}
        </p>
        <p v-else>
            {{ dateFormatter(state.dateRange.start, 'MMMM D') }} ~ {{ dateFormatter(state.dateRange.end, 'D') }}, {{ dateFormatter(state.dateRange.end, 'YYYY') }}
        </p>
    </p-badge>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PBadge } from '@spaceone/design-system';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { DateRange } from '@/services/dashboards/config';


const props = defineProps<{
    dateRange: DateRange;
}>();

const state = reactive({
    dateRange: computed<DateRange>(() => props.dateRange),
});

const { i18nDayjs } = useI18nDayjs();
const dateFormatter = (date: string, format: string) => i18nDayjs.value.utc(date).format(format);
</script>
<style scoped lang="postcss">
.dashboard-date-range-badge {
    margin-right: 0.5rem;
    height: 1.25rem;
}
</style>
