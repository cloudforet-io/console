import {
    CustomLayout,
    DashboardPrivacyType,
    DefaultLayout,
    PublicDashboardInfo, UserDashboardInfo,
    WidgetInfo,
} from '@/services/billing/cost-management/cost-dashboard/type';

export interface CostDashboardState {
    originSelectedWidget: WidgetInfo;
    editedSelectedWidget?: WidgetInfo;
    //
    selectedTemplate: Record<string, DefaultLayout> | PublicDashboardInfo;
    defaultFilter: Record<string, string[]>;
    selectedDashboardPrivacy: DashboardPrivacyType;
    //
    editedCustomLayout?: CustomLayout[];
    widgetPosition?: { row?: number; col?: number };
    layoutOfSpace?: number;
    //
    publicDashboardList: PublicDashboardInfo[];
    userDashboardList: UserDashboardInfo[];
    dashboardListLoading: boolean;
}
