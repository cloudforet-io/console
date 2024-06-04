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
    // widgetLocation?: Location;
    //
    mode: 'overlay'|'customize'|'view';
    // dateText?: string;
    // currency?: Currency;

    // loading?: boolean;
    // editMode?: boolean;
    // errorMode?: boolean;
    // theme?: WidgetTheme;
}
