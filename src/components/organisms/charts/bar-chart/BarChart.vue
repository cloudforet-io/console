
<script lang="ts">
import { defineComponent, toRefs } from '@vue/composition-api';
// @ts-ignore
import PAbstractChart from '@/components/organisms/charts/abstract-chart/AbstractChart.vue';
import {
    barChartProps,
    BarChartPropsType, barChartThemes,
} from '@/components/organisms/charts/bar-chart/BarChart.toolset';
import {
    AbstractChartToolset,
    ChartToolsetType,
} from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export default defineComponent({
    name: 'PBarChart',
    extends: PAbstractChart,
    props: barChartProps,
    setup(props: BarChartPropsType) {
        const state: UnwrapRef<ChartToolsetType> = new AbstractChartToolset<BarChartPropsType>(props, barChartThemes).ts;

        return {
            ...toRefs(state),
        };
    },
});
</script>
