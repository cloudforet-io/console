import type {
    REFRESH_INTERVAL_OPTIONS_MAP,
    DASHBOARD_TYPE,
} from '@/api-clients/dashboard/_constants/dashboard-constant';
import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type {
    InheritOptions, WidgetOptions, WidgetSize,
} from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDashboardChangeFolderParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/change-folder';
import type { PrivateDashboardCreateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/create';
import type { PrivateDashboardDeleteParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/delete';
import type { PrivateDashboardGetParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/get';
import type { PrivateDashboardListParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/list';
import type { PrivateDashboardUpdateParameters } from '@/api-clients/dashboard/private-dashboard/schema/api-verbs/update';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import type { PublicDashboardChangeFolderParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/change-folder';
import type { PublicDashboardCreateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/create';
import type { PublicDashboardDeleteParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/delete';
import type { PublicDashboardGetParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/get';
import type { PublicDashboardListParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/list';
import type { PublicDashboardUpdateParameters } from '@/api-clients/dashboard/public-dashboard/schema/api-verbs/update';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';

import type { VariableModelType } from '@/lib/variable-models';
import type { Value } from '@/lib/variable-models/_base/types';


export type DashboardType = typeof DASHBOARD_TYPE[keyof typeof DASHBOARD_TYPE];
export type DashboardFolderType = 'PUBLIC'|'PRIVATE';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DashboardModel = PublicDashboardModel | PrivateDashboardModel;
export type DashboardFolderModel = PublicFolderModel | PrivateFolderModel;
export type DashboardCreateParams = PublicDashboardCreateParameters | PrivateDashboardCreateParameters;
export type DashboardChangeFolderParams = PublicDashboardChangeFolderParameters | PrivateDashboardChangeFolderParameters;
export type DashboardListParams = PublicDashboardListParameters | PrivateDashboardListParameters;
export type DashboardUpdateParams = PublicDashboardUpdateParameters | PrivateDashboardUpdateParameters;
export type DashboardDeleteParams = PublicDashboardDeleteParameters | PrivateDashboardDeleteParameters;
export type DashboardGetParams = PublicDashboardGetParameters | PrivateDashboardGetParameters;

// dashboard variable schema types
type VariableSelectionType = 'SINGLE' | 'MULTI';

export type TemplateType = 'MANAGED'|'EXTENSION';

interface DashboardVariableOptions {
    type: VariableModelType;
    key: string;
    dataKey?: string;
    values?: Value[];
}

export interface DashboardVariableSchemaProperty {
    name: string;
    variable_type: VariableModelType;
    use: boolean;
    selection_type?: VariableSelectionType;
    description?: string;
    readonly?: boolean; // can not edit value
    options?: DashboardVariableOptions[];
    fixed?: boolean; // can not delete this variable from dashboard
    required?: boolean; // value is required
}

type DashboardVariableSchemaProperties = Record<string, DashboardVariableSchemaProperty>;

export interface DashboardVariablesSchema {
    properties: DashboardVariableSchemaProperties;
    order: string[];
    fixed_options?: Record<string, any>;
}

export interface DashboardGlobalVariablesSchema {
    properties: DashboardGlobalVariableSchemaProperties;
}
export type DashboardGlobalVariableSchemaProperties = Record<string, DashboardGlobalVariable>;

// dashboard variables types
export type DashboardVariables = SingleSelectDashboardVariables | MultiSelectDashboardVariables;
interface SingleSelectDashboardVariables {
    [key: string]: string;
}
interface MultiSelectDashboardVariables {
    [key: string]: string[];
}

export type DashboardScope = 'WORKSPACE'|'PROJECT';

export type RefreshIntervalOption = keyof typeof REFRESH_INTERVAL_OPTIONS_MAP;
// dashboard options types
export interface DashboardOptions {
    date_range?: DateRange;
    refresh_interval_option?: RefreshIntervalOption;
}
export interface DateRange {
    start?: string;
    end?: string;
}

export type AdminDashboardType = 'WORKSPACE'|'ADMIN';

export type DashboardVars = Record<string, string[]|number[]|string|number>;

export interface DashboardLayout {
    name?: string;
    widgets?: Array<DashboardLayoutWidgetInfo|string>;
    options?: any;
}
export interface DashboardLayoutWidgetInfo {
    widget_name: string; // widget config name
    widget_key: string; // widget unique key. used for layout key binding.
    template_widget_id?: string; // widget id included in template. used to find widget settings to refer to when resetting widgets.
    title?: string; // widget title
    widget_options?: WidgetOptions;
    size?: WidgetSize;
    version: string; // widget config version
    inherit_options?: InheritOptions; // inherit information for the widget option
    schema_properties?: string[]; // schema properties that are shown on widget form. updated when use add more options.
    fixed_options?: Record<string, any>; // fixed options for the widget
}
