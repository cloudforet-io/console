<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PLoadingChart, { chartSetup } from '@/components/organisms/charts/loading-chart/LoadingChart.vue';
import {
    donutChartProps, DonutChartPropsType, options, plugins, settings,
} from '@/components/organisms/charts/donut-chart/DonutChart.toolset';

import { colorset } from '@/lib/util';
import hexToRgba from 'hex-to-rgba';

export default defineComponent({
    name: 'PDonutChart',
    extends: PLoadingChart,
    props: donutChartProps,
    setup(props: DonutChartPropsType) {
        const state: any = reactive(chartSetup(props));

        state.options = computed(() => options[props.styleType](props));
        state.plugins = computed(() => plugins[props.styleType](props));
        state.datasets = computed(() => {
            if (state.chartRef) {
                const res = props.dataset.map((d, i) => ({
                    data: d.data,
                    ...settings[props.styleType](props),
                    borderColor: '#fff',
                    backgroundColor: colorset,
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
