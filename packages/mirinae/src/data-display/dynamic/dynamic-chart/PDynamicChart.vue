<template>
    <div class="p-dynamic-chart">
        <p-data-loader :loading="loading"
                       :data="data"
                       loader-type="skeleton"
        >
            <component :is="state.component"
                       :data="data"
                       :value-options="valueOptions"
                       :name-options="nameOptions"
                       :field-handler="fieldHandler"
                       :theme="theme"
                       :limit="limit"
                       class="chart"
            />
        </p-data-loader>
    </div>
</template>

<script setup lang="ts">
import {
    reactive, watch,
    defineAsyncComponent,
} from 'vue';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_TYPE,
    DYNAMIC_CHART_THEMES,
} from '@/data-display/dynamic/dynamic-chart/config';
import type {
    DynamicChartProps, DynamicChartType,
} from '@/data-display/dynamic/dynamic-chart/type';
import PDataLoader from '@/feedbacks/loading/data-loader/PDataLoader.vue';

// TODO: this (any) must be refactored
const componentMap: Record<DynamicChartType, any> = {
    COLUMN: defineAsyncComponent(() => import('./templates/column/index.vue')),
    DONUT: defineAsyncComponent(() => import('./templates/donut/index.vue')),
    TREEMAP: defineAsyncComponent(() => import('./templates/treemap/index.vue')),
};

const props = withDefaults(defineProps<DynamicChartProps>(), {
    loading: false,
    data: () => [],
    valueOptions: () => ({ ...DEFAULT_VALUE_OPTIONS }),
    nameOptions: () => ({ ...DEFAULT_NAME_OPTIONS }),
    theme: DYNAMIC_CHART_THEMES[0],
});

// TODO: this (any) must be refactored
const state = reactive({
    component: null as null|any,
});

const getComponent = async () => {
    try {
        if (!DYNAMIC_CHART_TYPE.includes(props.type)) {
            throw new Error(`[Dynamic Chart] Unacceptable chart type: chart type must be one of ${DYNAMIC_CHART_TYPE}. ${props.type} is not acceptable.`);
        }

        state.component = componentMap[props.type];
    } catch (e) {
        console.error(e);
        state.component = null;
    }
};

watch(() => props.type, (aft, bef) => {
    if (aft !== bef) {
        getComponent();
    }
}, { immediate: true });

</script>
<style lang="postcss">
.p-dynamic-chart {
    > .p-data-loader {
        height: 100%;
        > .data-loader-container .data-wrapper {
            overflow: hidden;
        }
        .chart {
            height: 100%;
        }
    }
}
</style>
