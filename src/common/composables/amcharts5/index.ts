import type { ComputedRef } from 'vue';
import {
    computed, reactive, toRefs, watchEffect,
} from 'vue';

import * as am5 from '@amcharts/amcharts5';
import type { Root } from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { createDonutChart, createPieChart, createPieSeries } from '@/common/composables/amcharts5/pie-chart-helper';
import type { ChartContext } from '@/common/composables/amcharts5/type';
import { createXYDateChart, createXYLineSeries, createXYStackedColumnSeries } from '@/common/composables/amcharts5/xy-chart-helper';

export const useAmcharts5 = (
    chartContext: ComputedRef<ChartContext>,
) => {
    const state = reactive({
        root: computed(() => (chartContext.value ? am5.Root.new(chartContext.value) : undefined)),
    });

    const initRoot = (root: Root): void => {
        root.setThemes([am5themes_Animated.new(root)]);
        root.utc = true;
    };

    const disposeRoot = () => {
        if (!state.root) return;
        am5.array.each(am5.registry.rootElements, (d) => {
            if (d === state.root) {
                d.dispose();
            }
        });
    };

    const clearChildrenOfRoot = () => {
        if (state.root) state.root.container.children.clear();
    };

    watchEffect(() => {
        if (state.root) initRoot(state.root);
    });

    return {
        ...toRefs(state),
        disposeRoot,
        clearChildrenOfRoot,
        //
        createXYDateChart,
        createPieChart,
        createDonutChart,
        //
        createXYLineSeries,
        createXYStackedColumnSeries,
        createPieSeries,
    };
};
