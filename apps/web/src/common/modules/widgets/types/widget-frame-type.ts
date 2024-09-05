import type { TranslateResult } from 'vue-i18n';

import type { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';

import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { WidgetState } from '@/common/modules/widgets/types/widget-model';


export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];
export interface FullDataLink {
    name?: string;
    location?: Location;
}

export interface WidgetFrameProps {
    widgetId: string;
    widgetOptions?: Record<WidgetFieldName, WidgetFieldValues>;
    widgetSizes: WidgetSize[];
    dataTableId?: string;
    //
    mode: 'overlay'|'view'|'edit-layout';
    loading?: boolean;
    errorMessage?: string;
    noData?: boolean;
    widgetState?: WidgetState;
    disableManageButtons?: boolean;
    //
    title?: TranslateResult;
    description?: string;
    size?: WidgetSize;
    width?: number;
    periodText?: string;
    unitMap?: Record<string, string>;
    fullDataLinkList?: FullDataLink[];
    annotation?: string;
}
