<script lang="ts">
import {
    defineComponent, toRefs,
} from '@vue/composition-api';
// @ts-ignore
import PAbstractChart from '@/components/organisms/charts/abstract-chart/AbstractChart.vue';
import {
    lineChartProps, LineChartPropsType, lineChartThemes,
} from '@/components/organisms/charts/line-chart/LineChart.toolset';
import { AbstractChartToolset, ChartToolsetType } from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


export default defineComponent({
    name: 'PLineChart',
    extends: PAbstractChart,
    props: lineChartProps,
    setup(props: LineChartPropsType) {
        const state: UnwrapRef<ChartToolsetType> = new AbstractChartToolset<LineChartPropsType>(props, lineChartThemes).ts;

        return {
            ...toRefs(state),
        };
    },
});
</script>
