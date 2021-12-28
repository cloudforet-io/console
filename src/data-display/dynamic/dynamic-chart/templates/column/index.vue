<template>
    <div class="p-dynamic-chart-column">
        <div v-for="(value, idx) in values"
             :key="`${contextKey}-${idx}`"
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
                                     :data="commaFormatter(value)"
                                     :options="valueOptions.options"
                                     :extra-data="valueOptions"
                                     :handler="fieldHandler"
                    />
                </span>
            </div>
            <p-progress-bar :percentage="getPercentage(value)" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    onUnmounted, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { max } from 'lodash';

import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';
import { commaFormatter, getContextKey } from '@/util/helpers';
import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS,
} from '@/data-display/dynamic/dynamic-chart/config';
import { DynamicChartFieldHandler, DynamicChartTemplateProps } from '@/data-display/dynamic/dynamic-chart/type';
import PProgressBar from '@/data-display/progress-bar/PProgressBar.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';


export default defineComponent<DynamicChartTemplateProps>({
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
    },
    setup(props) {
        const state = reactive({
            names: computed<number[]>(() => {
                const nameKey = props.nameOptions.key;
                return props.data.map(d => getValueByPath(d, nameKey));
            }),
            values: computed<number[]>(() => {
                const valueKey = props.valueOptions.key;
                return props.data.map((d) => {
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
        });

        const getPercentage = (value: number) => {
            const maxValue = state.max;
            return maxValue === 0 ? 0 : value / maxValue * 100;
        };

        const stopDataWatch = watch(() => props.data, () => {
            state.contextKey = getContextKey();
        });

        onUnmounted(() => {
            if (stopDataWatch) stopDataWatch();
        });

        return {
            ...toRefs(state),
            getValueByPath,
            commaFormatter,
            getPercentage,
            DEFAULT_CHART_COLORS,
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-chart-column {
    width: 100%;
    .label-wrapper {
        display: flex;
        justify-content: space-between;
        > .name {
            font-size: 0.875rem;
            line-height: 1.5;
        }
        > .value {
            font-size: 0.875rem;
            line-height: 1.5;
            font-weight: bold;
        }
    }
}
</style>
