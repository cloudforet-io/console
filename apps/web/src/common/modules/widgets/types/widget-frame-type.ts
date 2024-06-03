import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router/types/router';

import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';

import type { Currency } from '@/store/modules/settings/type';


export interface WidgetFrameProps {
    widgetId: string;
    widgetSizes: WidgetSize[];

    title?: TranslateResult;
    description?: string;
    size?: WidgetSize;
    width?: number;
    widgetLocation?: Location;

    dateText?: string;
    currency?: Currency;

    loading?: boolean;
    editMode?: boolean;
    errorMode?: boolean;
    // theme?: WidgetTheme;
}
