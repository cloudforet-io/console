import { Tags, TimeStamp } from '@/models';
import { CostQueryFilters, Period } from '@/services/cost-explorer/type';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';

const DASHBOARD_SCOPE = {
    PRIVATE: 'PRIVATE',
    PUBLIC: 'PUBLIC',
} as const;

export type DASHBOARD_SCOPE = typeof DASHBOARD_SCOPE[keyof typeof DASHBOARD_SCOPE];

interface DefaultFilter {
    projects?: string[];
    project_groups?: string[];
    service_accounts?: string[];
    provider?: string[];
}
export interface DashboardItem {
    created_at: TimeStamp;
    updated_at: TimeStamp;
    custom_layouts: CustomLayout[];
    default_filter: DefaultFilter;
    default_layout_id: string;
    domain_id?: string;
    name: string;
    scope: DASHBOARD_SCOPE;
    tags: Tags;
    user_id: string;
    period_type: string;
    period?: Period;
}

export interface PublicDashboardInfo extends DashboardItem {
    public_dashboard_id: string;
}

export interface UserDashboardInfo extends DashboardItem {
    user_dashboard_id: string;
}

export type DashboardInfo = PublicDashboardInfo | UserDashboardInfo;

export type DashboardMenuItem = Partial<DashboardInfo> & { label: string; routeName: string};


export const CHART_TYPE = Object.freeze({
    CARD: 'CARD',
    TREEMAP: 'TREEMAP',
    MAP: 'MAP',
    LINE: 'LINE',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
    PIE: 'PIE',
    WAFFLE: 'WAFFLE',
    TABLE: 'TABLE',
} as const);
export type CHART_TYPE = typeof CHART_TYPE[keyof typeof CHART_TYPE];

export interface WidgetOptions {
    stack?: boolean;
    granularity?: GRANULARITY;
    filters?: CostQueryFilters;
    period?: Period;
    group_by?: string | GROUP_BY;
    chart_type?: CHART_TYPE;
    chart_img?: string;
    chart_desc_translation_id?: string;
    layout: number;
}

export const EDITABLE_WIDGET_OPTIONS = Object.freeze({
    GRANULARITY: 'granularity',
    GROUP_BY: 'group_by',
} as const);
export type EDITABLE_WIDGET_OPTIONS_TYPE = typeof EDITABLE_WIDGET_OPTIONS[keyof typeof EDITABLE_WIDGET_OPTIONS];

export interface WidgetInfo {
    widget_id: string;
    name?: string;
    options: WidgetOptions;
}

export interface DefaultLayout {
    name: string;
    widgetList: any;
}

export type CustomLayout = WidgetInfo[];

export const PERIOD_TYPE = Object.freeze({
    AUTO: 'AUTO',
    FIXED: 'FIXED',
} as const);
export type PeriodType = typeof PERIOD_TYPE[keyof typeof PERIOD_TYPE];

export interface DashboardCreateParam {
    name: string;
    default_layout_id?: string;
    custom_layouts?: CustomLayout[];
    default_filter?: DefaultFilter;
    period_type: PeriodType;
    period?: Period;
    tags?: Tags;
    domain_id?: string;
}

export const DASHBOARD_PRIVACY_TYPE = Object.freeze({
    PUBLIC: 'PUBLIC',
    USER: 'USER',
} as const);
export type DashboardPrivacyType = typeof DASHBOARD_PRIVACY_TYPE[keyof typeof DASHBOARD_PRIVACY_TYPE]
