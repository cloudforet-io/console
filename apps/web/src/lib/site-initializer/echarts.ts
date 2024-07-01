import {
    BarChart, GaugeChart, HeatmapChart, LineChart, MapChart, PieChart, TreemapChart, ScatterChart,
} from 'echarts/charts';
import {
    DatasetComponent,
    GeoComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    VisualMapComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';


export const initEcharts = () => {
    use([
        CanvasRenderer,
        GeoComponent,
        TooltipComponent,
        LegendComponent,
        GridComponent,
        DatasetComponent,
        VisualMapComponent,
        MapChart,
        BarChart,
        GaugeChart,
        HeatmapChart,
        LineChart,
        PieChart,
        TreemapChart,
        ScatterChart,
    ]);
};
