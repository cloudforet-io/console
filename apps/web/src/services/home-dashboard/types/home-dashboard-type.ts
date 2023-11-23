import type { HOME_DASHBOARD_DATA_TYPE } from '@/services/home-dashboard/constants/home-dashboard-constant';

export type HomeDashboardDataType = typeof HOME_DASHBOARD_DATA_TYPE[keyof typeof HOME_DASHBOARD_DATA_TYPE];
