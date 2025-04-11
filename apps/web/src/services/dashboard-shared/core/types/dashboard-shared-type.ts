import type { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/dashboard-shared/core/constants/dashboard-shared-constant';

export type DashboardSharedEntryPoint = typeof DASHBOARD_SHARED_ENTRY_POINT[keyof typeof DASHBOARD_SHARED_ENTRY_POINT];
