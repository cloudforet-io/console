import type { TranslateResult } from 'vue-i18n';

import type {
    DashboardOptions,
    DashboardVariables,
} from '@/schema/dashboard/_types/dashboard-type';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-display-constant';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';


export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];

export interface WidgetProps {
    widgetName: string;
    widgetId: string;
    dataTableId?: string;
    title?: string;
    description?: string;
    size?: WidgetSize;
    width?: number;
    widgetOptions?: Record<WidgetFieldName, WidgetFieldValues>;
    //
    mode?: 'overlay'|'view';
    // from dashboard
    loading?: boolean;
    dashboardOptions?: DashboardOptions;
    dashboardVariables?: DashboardVariables;
    disableRefreshOnVariableChange?: boolean;
}

export interface WidgetEmit {
    (e: 'mounted'): void;
    (e: 'update-size', size: WidgetSize): void;
    (event: 'click-delete'): void;
    (event: 'click-edit'): void;
}

export interface WidgetFrameEmit {
    (e: 'update-size', size: WidgetSize): void;
    (event: 'click-delete'): void;
    (event: 'click-edit'): void;
}

export interface WidgetExpose<Data = any> {
    loadWidget: (data?: Data) => Promise<Data|APIErrorToast>;
}


export interface Legend {
    name: string;
    label?: TranslateResult;
    color?: string;
    disabled?: boolean; // this is used only in widget data table
}
