<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import PLoadingChart, { chartSetup } from '@/components/organisms/charts/loading-chart/LoadingChart.vue';
import {
    lineChartProps, LineChartPropsType, options, settings, plugins,
} from '@/components/organisms/charts/line-chart/LineChart.toolset';
import Chart from 'chart.js';
import hexToRgba from 'hex-to-rgba';
import { colorset } from '@/lib/util';


export default defineComponent({
    name: 'LineChart',
    extends: PLoadingChart,
    props: lineChartProps,
    setup(props: LineChartPropsType) {
        const state: any = reactive(chartSetup(props));

        const getGradientColor = (color: string) => {
            const ctx: CanvasRenderingContext2D = state.chartRef.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 150);
            gradient.addColorStop(0, hexToRgba(color, 0.25));
            gradient.addColorStop(0.5, hexToRgba(color, 0.125));
            gradient.addColorStop(1, hexToRgba(color, 0));
            return gradient;
        };

        state.options = computed(() => options[props.styleType](props));
        state.plugins = computed(() => plugins[props.styleType](props));
        state.datasets = computed(() => {
            if (state.chartRef) {
                const res = props.dataset.map((d, i) => ({
                    label: d.label,
                    data: d.data,
                    ...settings[props.styleType](props),
                    borderColor: props.color || colorset[i],
                    backgroundColor: props.gradient
                        ? getGradientColor(props.color || colorset[i])
                        : hexToRgba(props.color || colorset[i], 0.04),
                }));
                return res;
            }
            return [];
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
