import type { TranslateResult } from 'vue-i18n';

import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';


export interface WidgetFrameProps {
    widgetId: string;
    widgetSizes: WidgetSize[];
    //
    title?: TranslateResult;
    description?: string;
    size?: WidgetSize;
    width?: number;
    basedOnText?: string;
    unit?: string;
    fullDataLinkText?: string;
    fullDataLocation?: Location;
    //
    mode: 'overlay'|'view';
    loading?: boolean;
    // editMode?: boolean;
    // errorMode?: boolean;
    // theme?: WidgetTheme;
}
