import {
    PublicDashboardInfo,
    DashboardPrivacyType,
    DefaultLayout,
} from '@/services/billing/cost-management/cost-dashboard/type';

export interface CostDashboardCreateState {
    selectedTemplate: Record<string, DefaultLayout> | PublicDashboardInfo;
    defaultFilter: Record<string, string[]>;
    selectedDashboardPrivacy: DashboardPrivacyType;
}
