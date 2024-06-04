import type { UnwrapRef } from 'vue';
import { reactive } from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';

import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { DateRange } from '@/schema/dashboard/_types/dashboard-type';
import type { DataMapping, Granularity } from '@/schema/dashboard/_types/widget-type';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetProps } from '@/common/modules/widgets/types/widget-display-type';


interface WidgetChartState {
    dateRange?: DateRange;
    dateFormat?: string;
    timeUnit: TimeUnit;
    dataMapping: DataMapping;
    chartOptions: Record<string, any>;
    granularity?: Granularity;
}

export const useWidgetChartState = (
    props: UnwrapRef<WidgetProps>,
): { widgetChartState: WidgetChartState } => {
    const widgetConfig = getWidgetConfig(props.widgetName);
    let dateRangeFormat = 'YYYY-MM';
    let timeUnit = 'month';
    let dateFormat = 'yyyy-MM';
    if (widgetConfig.meta.granularity === GRANULARITY.YEARLY) {
        dateRangeFormat = 'YYYY';
        timeUnit = 'year';
        dateFormat = 'yyyy';
    }
    if (widgetConfig.meta.granularity === GRANULARITY.DAILY) {
        dateRangeFormat = 'YYYY-MM-DD';
        timeUnit = 'day';
        dateFormat = 'yyyy-MM-dd';
    }
    const xAxisCount = props.chartOptions.x_axis_count ?? 4;
    const end = dayjs.utc(props.baseOnDate).format(dateRangeFormat);
    const start = dayjs.utc(props.baseOnDate).subtract(xAxisCount, timeUnit).format(dateRangeFormat);
    const widgetChartState = reactive({
        dateRange: { start, end },
        dateFormat,
        timeUnit,
        dataMapping: props.dataMapping,
        chartOptions: props.chartOptions,
        granularity: widgetConfig.meta.granularity,
    });

    return { widgetChartState };
};
