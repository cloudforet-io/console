import type { DASHBOARD_CONTROL_MENU_ACTION_TYPES } from '@/services/_shared/dashboard/core/constants/dashboard-control-menu-constant';

export type DashboardControlActionType = typeof DASHBOARD_CONTROL_MENU_ACTION_TYPES[keyof typeof DASHBOARD_CONTROL_MENU_ACTION_TYPES];
