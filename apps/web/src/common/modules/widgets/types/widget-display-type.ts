import type {
    DashboardOptions,
    DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';

import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-display-constant';
import type { WidgetFieldValue } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { WidgetState } from '@/common/modules/widgets/types/widget-model';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];

export interface WidgetProps {
    widgetName: string;
    widgetId: string;
    widgetState?: WidgetState;
    dataTableId?: string;
    title?: string;
    description?: string;
    size?: WidgetSize;
    width?: number;
    widgetOptions?: Record<WidgetFieldName, WidgetFieldValue<WidgetFieldValues>>;
    //
    mode?: 'overlay'|'view';
    // from dashboard
    loading?: boolean;
    dashboardOptions?: DashboardOptions;
    dashboardVars?: DashboardVars;
    disableRefreshOnVariableChange?: boolean;
    disableRefreshOnLoading?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
    disableManageButtons?: boolean;
}

export interface WidgetEmit {
    (event: 'mounted', widgetName: string): void;
    (event: 'click-expand'): void;
    (event: 'click-delete'): void;
    (event: 'click-edit'): void;
    (event: 'toggle-size', size: WidgetSize): void;
    // for only widget frame
    (event: 'click-clone'): void;
}

export type WidgetOverlayType = 'ADD'|'EDIT'|'EXPAND';

export interface WidgetExpose {
    loadWidget: (...args: any) => Promise<void>;
}
