import type { DATA_FIELD_HEATMAP_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';

export type DataFieldHeatmapColor = keyof typeof DATA_FIELD_HEATMAP_COLOR;

export interface DataFieldHeatmapColorOptions {
    default?: DataFieldHeatmapColor;
}

export interface DataFieldHeatmapColorValue {
    [key: string]: {
        colorInfo: DataFieldHeatmapColor;
    };
}
