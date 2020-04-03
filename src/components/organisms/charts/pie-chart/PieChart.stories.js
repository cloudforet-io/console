import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { pieChartProps } from '@/components/organisms/charts/pie-chart/PieChart.toolset';
import { ChartData } from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import PPieChart from '@/components/organisms/charts/pie-chart/PieChart.vue';
import casual, { arrayOf } from '@/lib/casual';

export default {
    title: 'organisms/charts/PieChart',
    component: PPieChart,
    parameters: {
        info: {
            summary: '',
            components: { PPieChart },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PPieChart },
    props: getKnobProps(pieChartProps, {
        labels: arrayOf(7, () => casual.word),
        dataset: [
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
    }),
    template: `
    <div class="text-center" style="width: 80vw;">
        <PPieChart v-bind="$props" class="border border-gray" style="height: 170px; width: 170px;"></PPieChart>
        <PPieChart v-bind="$props" class="border border-gray" style="height: 150px; width: 200px;"></PPieChart>
        <PPieChart v-bind="$props" class="border border-gray" style="height: 250px; width: 200px;"></PPieChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
