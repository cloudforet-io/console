import {
    DashboardInfo,
    DashboardPrivacyType,
    DefaultLayout,
} from '@/services/billing/cost-management/cost-dashboard/type';

export interface CostDashboardCreateState {
    selectedTemplate: Record<string, DefaultLayout> | DashboardInfo;
    defaultFilter: Record<string, string[]>;
    selectedDashboardPrivacy: DashboardPrivacyType;
}
