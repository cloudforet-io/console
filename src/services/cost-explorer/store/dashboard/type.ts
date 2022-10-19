import type {
    CustomLayout,
    DashboardPrivacyType,
    DefaultLayout,
    PublicDashboardInfo,
    WidgetInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import type { CostFiltersMap } from '@/services/cost-explorer/type';

export interface CostDashboardState {
    originSelectedWidget: WidgetInfo;
    editedSelectedWidget?: WidgetInfo;
    //
    selectedTemplate: Record<string, DefaultLayout> | PublicDashboardInfo;
    defaultFilter: CostFiltersMap;
    includesFilter: boolean;
    selectedDashboardPrivacy: DashboardPrivacyType;
    //
    editedCustomLayout?: CustomLayout[];
    widgetPosition?: { row?: number; col?: number };
    layoutOfSpace?: number;
}
