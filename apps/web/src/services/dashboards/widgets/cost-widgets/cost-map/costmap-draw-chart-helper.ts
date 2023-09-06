import {
    gray, palette, transparent, white,
} from '@/styles/colors';

import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import type { TreemapChartData } from '@/services/dashboards/widgets/cost-widgets/cost-map/costmap-chart-data-helper';

export const setThemeColorsToTreemapData = (treemapData: TreemapChartData['children'], theme?: WidgetTheme): TreemapChartData['children'] => {
    const themeColorName: WidgetTheme = theme || 'violet';
    const results: TreemapChartData['children'] = [];

    treemapData.forEach((d, idx) => {
        let backgroundColor = palette[themeColorName][200];
        let fontColor;

        switch (true) {
        case [0].includes(idx):
            backgroundColor = palette[themeColorName][700];
            fontColor = white;
            break;
        case [1].includes(idx):
            backgroundColor = palette[themeColorName][500];
            fontColor = gray[900];
            break;
        case [2].includes(idx):
            backgroundColor = palette[themeColorName][400];
            fontColor = gray[900];
            break;
        case [3].includes(idx):
            backgroundColor = palette[themeColorName][300];
            fontColor = gray[900];
            break;
        case [4, 5, 6, 7].includes(idx):
            backgroundColor = palette[themeColorName][300];
            fontColor = transparent;
            break;
        default:
            backgroundColor = palette[themeColorName][200];
            fontColor = transparent;
            break;
        }

        results.push({
            ...d,
            background_color: backgroundColor,
            font_color: fontColor,
        });
    });
    return results;
};
