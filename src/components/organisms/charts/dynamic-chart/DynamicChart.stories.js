import {
    toRefs, reactive, ref, computed, watch,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { dynamicChartProps } from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';
import { ChartData } from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import casual, { arrayOf } from '@/lib/casual';
import { pieDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/pie-chart';
import { lineDefaultThemeProps, lineMultiThemePropsType } from '@/components/organisms/charts/dynamic-chart/themes/line-chart';
import { barDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/bar-chart';
import PDynamicChart from './DynamicChart.vue';

export default {
    title: 'organisms/charts/DynamicChart',
    component: PDynamicChart,
    parameters: {
        info: {
            summary: '',
            components: { PDynamicChart },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const lineChart = () => ({
    components: { PDynamicChart },
    props: getKnobProps(dynamicChartProps, {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dataset: [
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
        styleType: 'default',
    }, {
        type: true,
        themeProps: true,
    }, {
        styleType: select,
    }, {
        styleType: ['default', 'multi'],
    }),
    template: `
        <div style="width: 80vw;">
            <PDynamicChart v-bind="$props" type="line"
                           :theme-props="themeProps"
            ></PDynamicChart>
        </div>`,
    setup(props, context) {
        const state = reactive({
            themeProps: lineDefaultThemeProps,
        });

        watch(() => props.styleType, (val) => {
            if (val === 'default') state.themeProps = lineDefaultThemeProps;
            else if (val === 'multi') state.themeProps = lineMultiThemePropsType;
        });
        return {
            ...toRefs(state),
        };
    },
});

export const doughnutChart = () => ({
    components: { PDynamicChart },
    props: getKnobProps(dynamicChartProps, {
        labels: arrayOf(7, () => casual.word),
        dataset: [
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
        styleType: 'default',
        themeProps: pieDefaultThemeProps,
    }, { type: true }),
    template: `
    <div style="width: 80vw;">
        <PDynamicChart v-bind="$props" type="doughnut"></PDynamicChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});


export const barChart = () => ({
    components: { PDynamicChart },
    props: getKnobProps(dynamicChartProps, {
        labels: arrayOf(7, () => casual.word),
        dataset: arrayOf(2, () => new ChartData(casual.word, arrayOf(7, () => casual.integer(0)))),
        loading: false,
        styleType: 'default',
        type: 'bar',
        themeProps: barDefaultThemeProps,
    }, {}, {
        type: select,
    }, {
        type: ['bar', 'horizontalBar'],
    }),
    template: `
    <div style="width: 80vw;">
        <PDynamicChart v-bind="$props"></PDynamicChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
