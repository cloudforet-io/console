import type { COLUMN_CHART_SERIES_LABEL_POSITION, LINE_CHART_SERIES_LABEL_POSITION, PIE_CHART_SERIES_LABEL_POSITION } from '@/common/modules/widgets/_constants/widget-field-constant';

type ColumnChartSeriesLabelPosition = typeof COLUMN_CHART_SERIES_LABEL_POSITION[keyof typeof COLUMN_CHART_SERIES_LABEL_POSITION];
type PieChartSeriesLabelPosition = typeof PIE_CHART_SERIES_LABEL_POSITION[keyof typeof PIE_CHART_SERIES_LABEL_POSITION];
type LineChartSeriesLabelPosition = typeof LINE_CHART_SERIES_LABEL_POSITION[keyof typeof LINE_CHART_SERIES_LABEL_POSITION];
export interface DisplaySeriesLabelValue {
    toggleValue: boolean;
    position?: ColumnChartSeriesLabelPosition | PieChartSeriesLabelPosition | LineChartSeriesLabelPosition;
    rotate?: number;
}
