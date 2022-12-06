<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
                  :date-range="state.options.date_range"
                  :currency="state.options.currency"
    >
        <widget-data-table :loading="state.loading"
                           :fields="state.tableFields"
                           :items="state.tableItems"
        >
            <template #col-progress="{value}">
                <p-progress-bar size="lg"
                                :percentage="value"
                />
            </template>
            <template #col-rate="{value}">
                {{ value.toFixed(1) }}%
            </template>
        </widget-data-table>
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed, defineExpose, defineProps, reactive, toRefs,
} from 'vue';

import {
    PProgressBar,
} from '@spaceone/design-system';

import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
// import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';

interface Data {
    target: string;
    total_spent: number;
    total_budget: number;
}

// const TARGET_KEYS = [GROUP_BY.PROJECT, GROUP_BY.PROJECT_GROUP];

const props = defineProps<WidgetProps>();


const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    tableFields: computed<Field[]>(() => [
        { label: 'Target', name: 'target' },
        { label: 'Total spent', name: 'total_spent' },
        { label: 'Total budget', name: 'total_budget' },
        { label: ' ', name: 'progress' },
        { label: 'Rate', name: 'rate' },
    ]),
    tableItems: computed<Data[]>(() => state.data?.map((d) => {
        const percentage = getPercentage(d);
        return {
            ...d,
            progress: percentage,
            rate: percentage,
        };
    }) ?? []),
});

const fetchData = async (): Promise<Data[]> => new Promise((resolve) => {
    setTimeout(() => {
        resolve([
            { target: 'aaa', total_spent: 1111, total_budget: 10000 },
            { target: 'bbb', total_spent: 222, total_budget: 20000 },
            { target: 'c', total_spent: 333, total_budget: 30000 },
            { target: 'd', total_spent: 444, total_budget: 40000 },
            { target: 'e', total_spent: 555, total_budget: 200 },
            { target: 'f', total_spent: 666, total_budget: 4000 },

        ]);
    }, 2000);
});

const getPercentage = (item: Data) => item.total_spent / item.total_budget * 100;

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
};

useWidgetLifecycle({
    initWidget,
});

defineExpose({
    refreshWidget,
});


</script>

<style lang="postcss" scoped>
.widget-data-table {
    width: 100%;
    height: 100%;
}
</style>
