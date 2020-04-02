
<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PLoadingChart, { chartSetup } from '@/components/organisms/charts/loading-chart/LoadingChart.vue';
import {
    barChartProps,
    BarChartPropsType,
    options, plugins, settings,
} from '@/components/organisms/charts/bar-chart/BarChart.toolset';

import { colorset } from '@/lib/util';

export default defineComponent({
    name: 'PBarChart',
    extends: PLoadingChart,
    props: barChartProps,
    setup(props: BarChartPropsType) {
        const state: any = reactive(chartSetup(props));

        state.options = computed(() => options[props.styleType](props));
        state.plugins = computed(() => plugins[props.styleType](props));
        state.datasets = computed(() => {
            if (state.chartRef) {
                const res = props.dataset.map((d, i) => ({
                    label: d.label,
                    data: d.data,
                    ...settings[props.styleType](props),
                    borderColor: colorset[i],
                    backgroundColor: colorset[i],
                }));
                return res;
            }
            return [{}];
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
