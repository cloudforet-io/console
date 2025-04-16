import {
    inject, provide, computed, type ComputedRef,
} from 'vue';

import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import type { DashboardSharedEntryPoint } from '@/services/_shared/dashboard/core/types/dashboard-shared-type';


const DASHBOARD_ENTRY_POINT_KEY = Symbol('DashboardEntryPoint');
const DEFAULT_ENTRY_POINT = computed(() => DASHBOARD_SHARED_ENTRY_POINT.NONE_ENTRY_POINT);

export const provideDashboardEntryPoint = (entryPoint: ComputedRef<DashboardSharedEntryPoint>) => {
    provide(DASHBOARD_ENTRY_POINT_KEY, entryPoint);
};

export const useDashboardEntryPoint = (): ComputedRef<DashboardSharedEntryPoint> => inject(DASHBOARD_ENTRY_POINT_KEY, DEFAULT_ENTRY_POINT);
