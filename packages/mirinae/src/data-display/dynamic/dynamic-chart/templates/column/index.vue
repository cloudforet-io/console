<template>
    <div class="p-dynamic-chart-column">
        <div v-for="(value, idx) in values"
             :key="`${contextKey}-${idx}`"
             class="row-wrapper"
        >
            <div class="label-wrapper">
                <span class="name">
                    <p-dynamic-field :type="nameOptions.type"
                                     :data="names[idx]"
                                     :options="nameOptions.options"
                                     :extra-data="nameOptions"
                                     :handler="fieldHandler"
                    />
                </span>
                <span class="value">
                    <p-dynamic-field :type="valueOptions.type"
                                     :data="value"
                                     :options="valueOptions.options"
                                     :extra-data="valueOptions"
                                     :handler="fieldHandler"
                    />
                </span>
            </div>
            <p-progress-bar :color="progressBarColor"
                            :percentage="getPercentage(value)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    onUnmounted,
    reactive, toRefs, watch,
} from 'vue';

import { max } from 'lodash';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_LIMIT_MAP,
    DYNAMIC_CHART_THEMES,
} from '@/data-display/dynamic/dynamic-chart/config';
import type {
    DynamicChartFieldHandler,
    DynamicChartTemplateProps,
    DynamicChartTheme,
} from '@/data-display/dynamic/dynamic-chart/type';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PProgressBar from '@/data-display/progress-bar/PProgressBar.vue';
import { getContextKey } from '@/utils/helpers';

import { palette } from '@/styles/colors.cjs';

const themeColorMap: Record<DynamicChartTheme, string> = {
    VIOLET: palette.violet[400],
    BLUE: palette.blue[400],
    CORAL: palette.coral[400],
    YELLOW: palette.yellow[400],
    GREEN: palette.green[400],
    PEACOCK: palette.peacock[400],
    RED: palette.red[400],
    INDIGO: palette.indigo[400],
};

type DynamicChartColumnProps = DynamicChartTemplateProps & { limit: number };
export default defineComponent<DynamicChartColumnProps>({
    name: 'PDynamicChartColumn',
    components: { PDynamicField, PProgressBar },
    props: {
        data: {
            type: Array as PropType<DynamicChartTemplateProps['data']>,
            default: () => [],
        },
        valueOptions: {
            type: Object as () => DynamicChartTemplateProps['valueOptions'],
            default: () => ({ ...DEFAULT_VALUE_OPTIONS }),
        },
        nameOptions: {
            type: Object as () => DynamicChartTemplateProps['nameOptions'],
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
            default: DYNAMIC_CHART_LIMIT_MAP.COLUMN,
        },
    },
    setup(props) {
        const state = reactive({
            filteredData: computed<any[]>(() => {
                if (props.data.length > props.limit) return props.data.slice(0, props.limit);
                return props.data;
            }),
            names: computed<number[]>(() => {
                const nameKey = props.nameOptions.key;
                return state.filteredData.map((d) => getValueByPath(d, nameKey));
            }),
            values: computed<number[]>(() => {
                const valueKey = props.valueOptions.key;
                return state.filteredData.map((d) => {
                    let value = getValueByPath(d, valueKey);
                    if (typeof value !== 'number') value = 0;
                    return value;
                });
            }),
            max: computed<number>(() => {
                if (!state.values.length) return 0;
                return max(state.values) ?? 0;
            }),
            contextKey: getContextKey(),
            progressBarColor: computed<string>(() => themeColorMap[props.theme] ?? themeColorMap[DYNAMIC_CHART_THEMES[0]]),
        });

        const getPercentage = (value: number) => {
            const maxValue = state.max;
            return maxValue === 0 ? 0 : value / maxValue * 100;
        };

        const stopDataWatch = watch(() => state.filteredData, () => {
            state.contextKey = getContextKey();
        });

        onUnmounted(() => {
            if (stopDataWatch) stopDataWatch();
        });

        return {
            ...toRefs(state),
            getValueByPath,
            getPercentage,
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-chart-column {
    width: 100%;
    .row-wrapper {
        margin-bottom: 0.5rem;
    }
    .label-wrapper {
        display: flex;
        justify-content: space-between;
        > .name {
            font-size: 0.875rem;
            line-height: 1.25;
            margin-bottom: 0.125rem;
        }
        > .value {
            @apply text-gray-600;
            font-size: 0.875rem;
            line-height: 1.25;
        }
    }
}
</style>
