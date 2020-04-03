import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { ChartData, abstractChartProps } from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import casual, { arrayOf } from '@/lib/casual';
import { chartTimestampFormatter } from '@/lib/util';
import PAbstractChart from '@/components/organisms/charts/abstract-chart/AbstractChart.vue';

export default {
    title: 'organisms/LoadingChart',
    component: PAbstractChart,
    parameters: {
        info: {
            summary: '',
            components: { PAbstractChart },
        },
        knobs: { escapeHTML: false },
    },
};

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PAbstractChart },
    props: getKnobProps(abstractChartProps, {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dataset: [
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
    }),
    template: `
    <div style="width: 80vw;">
        <PAbstractChart v-bind="$props"></PAbstractChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});


export const multiCase = () => ({
    components: { PAbstractChart },
    props: getKnobProps(abstractChartProps, {
        labels: arrayOf(7, () => chartTimestampFormatter(casual._timestamp())),
        dataset: [
            new ChartData('line1', arrayOf(7, () => casual.integer(0, 500))),
            new ChartData('line2', arrayOf(7, () => casual.integer(0, 500))),
            new ChartData('line3', arrayOf(7, () => casual.integer(0, 500))),
        ],
        styleType: 'multi',
        loading: false,
        max: 500,
    }),
    template: `
    <div>
        <PAbstractChart v-bind="$props" class="inline-block" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PAbstractChart>
        <PAbstractChart v-bind="$props" class="inline-block" style="height: 200px; width: 300px;"></PAbstractChart>
        <PAbstractChart v-bind="$props" class="inline-block" style="height: 200px; width: 300px;"></PAbstractChart>
        <PAbstractChart v-bind="$props" class="inline-block" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PAbstractChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);
        return {
            ...toRefs(state),
        };
    },
});
