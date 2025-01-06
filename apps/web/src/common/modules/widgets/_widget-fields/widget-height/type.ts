import type { WIDGET_HEIGHT } from '@/common/modules/widgets/_constants/widget-field-constant';


export type WidgetHeightType = keyof typeof WIDGET_HEIGHT; // for Number Card Widget
export interface WidgetHeightValue {
    type: WidgetHeightType;
}


export interface WidgetHeightOptions {
    default?: WidgetHeightType;
}
