import type { Root } from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import type { IMapChartSettings } from '@amcharts/amcharts5/map';
import * as am5map from '@amcharts/amcharts5/map';

import { gray } from '@/styles/colors';

export const createMapChart = (root: Root, settings?: IMapChartSettings): am5map.MapChart => {
    const chart = root.container.children.push(am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        ...settings,
    }));
    chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ['AQ'],
        fill: am5.color(gray[200]),
    }));
    return chart;
};

export const createPointSeries = (root: Root, settings?: am5map.IMapPointSeriesSettings): am5map.MapPointSeries => am5map.MapPointSeries.new(root, {
    latitudeField: 'latitude',
    longitudeField: 'longitude',
    ...settings,
});
