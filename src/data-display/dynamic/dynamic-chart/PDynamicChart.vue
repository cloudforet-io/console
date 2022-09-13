<template>
    <div class="p-dynamic-chart">
        <p-data-loader :loading="loading"
                       :data="data"
                       loader-type="skeleton"
        >
            <component :is="component"
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

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';
import type { PropType, AsyncComponent } from 'vue';
import type { ImportedComponent } from 'vue/types/options';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_TYPE,
    DYNAMIC_CHART_THEMES,
} from '@/data-display/dynamic/dynamic-chart/config';
import type {
    DynamicChartFieldHandler,
    DynamicChartProps, DynamicChartTheme, DynamicChartType,
} from '@/data-display/dynamic/dynamic-chart/type';
import PDataLoader from '@/feedbacks/loading/data-loader/PDataLoader.vue';


const componentMap: Record<DynamicChartType, AsyncComponent> = {
    COLUMN: () => ({
        component: import('./templates/column/index.vue') as Promise<ImportedComponent>,
    }),
    DONUT: () => ({
        component: import('./templates/donut/index.vue') as Promise<ImportedComponent>,
    }),
    TREEMAP: () => ({
        component: import('./templates/treemap/index.vue') as Promise<ImportedComponent>,
    }),
};

export default defineComponent<DynamicChartProps>({
    name: 'PDynamicChart',
    components: { PDataLoader },
    props: {
        type: {
            type: String,
            required: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Array,
            default: () => [],
        },
        valueOptions: {
            type: Object as () => DynamicChartProps['valueOptions'],
            default: () => ({ ...DEFAULT_VALUE_OPTIONS }),
        },
        nameOptions: {
            type: Object as () => DynamicChartProps['nameOptions'],
            default: () => ({ ...DEFAULT_NAME_OPTIONS }),
        },
        fieldHandler: {
            type: Function as PropType<DynamicChartFieldHandler|undefined>,
            default: undefined,
        },
        theme: {
            type: String as PropType<DynamicChartTheme>,
            default: DYNAMIC_CHART_THEMES[0],
        },
        limit: {
            type: Number,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            component: null as null|AsyncComponent,
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

        return {
            ...toRefs(state),
        };
    },
});
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
