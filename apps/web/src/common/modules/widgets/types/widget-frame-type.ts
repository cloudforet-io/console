import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router/types/router';

import type { DateRange } from '@/schema/dashboard/_types/dashboard-type';
import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';

import type { Currency } from '@/store/modules/settings/type';

import type { WidgetTheme } from '@/common/modules/widgets/types/widget-display-type';


export interface WidgetFrameProps {
    title?: TranslateResult;
    widgetSizes: WidgetSize[];
    size?: WidgetSize;
    width?: number;
    widgetLocation?: Location;

    dateRange?: DateRange;
    currency?: Currency;

    editMode?: boolean;
    errorMode?: boolean;
    widgetKey: string;
    theme?: WidgetTheme;
}
