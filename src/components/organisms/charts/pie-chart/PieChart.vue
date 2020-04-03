<script lang="ts">
import { defineComponent, toRefs } from '@vue/composition-api';
// @ts-ignore
import PAbstractChart from '@/components/organisms/charts/abstract-chart/AbstractChart.vue';
import {
    pieChartProps, PieChartPropsType, pieChartThemes,
} from '@/components/organisms/charts/pie-chart/PieChart.toolset';

import { AbstractChartToolset, ChartToolsetType } from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export default defineComponent({
    name: 'PPieChart',
    extends: PAbstractChart,
    props: pieChartProps,
    setup(props: PieChartPropsType) {
        const state: UnwrapRef<ChartToolsetType> = new AbstractChartToolset<PieChartPropsType>(props, pieChartThemes).ts;

        return {
            ...toRefs(state),
        };
    },
});
</script>
