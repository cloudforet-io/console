import type { UnwrapRef } from 'vue';
import { computed } from 'vue';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { NewWidgetProps } from '@/common/modules/widgets/types/widget-display-type';


export const useWidgetChart = (
    props: UnwrapRef<NewWidgetProps>,
) => {
    const widgetConfig = getWidgetConfig(props.widgetName);
    const widgetChartState = computed(() => ({
        dateRange: props.dateRange,
        dateMapping: props.dataMapping,
        chartOptions: props.chartOptions,
        granularity: widgetConfig.meta.granularity,
    }));

    return { widgetChartState };
};
