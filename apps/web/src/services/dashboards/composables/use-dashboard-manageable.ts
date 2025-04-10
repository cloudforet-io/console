import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useUserStore } from '@/store/user/user-store';

import { useDashboardRouteContext } from '@/services/dashboard-shared/_composables/use-dashboard-route-context';
import { useDashboardGetQuery } from '@/services/dashboard-shared/dashboard-detail/composables/use-dashboard-get-query';

interface UseDashboardManageableOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardManageableReturn {
    isManageable: ComputedRef<boolean>;
}

export const useDashboardManageable = ({ dashboardId }: UseDashboardManageableOptions): UseDashboardManageableReturn => {
    const userStore = useUserStore();

    const { entryPoint } = useDashboardRouteContext();


    const storeState = reactive({
        isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });

    const { dashboard } = useDashboardGetQuery({
        dashboardId: computed(() => dashboardId.value),
    });

    const isManageable = computed(() => {
        if (entryPoint.value === 'ADMIN') return true;

        if (entryPoint.value === 'WORKSPACE') {
            if (dashboard.value?.dashboard_id.startsWith('private')) return true;
            const publicDashboard = dashboard.value as PublicDashboardModel;
            if (publicDashboard?.shared && publicDashboard?.resource_group === RESOURCE_GROUP.DOMAIN) return false;
            if (storeState.isWorkspaceOwner) return true;
            return false;
        }

        if (entryPoint.value === 'PROJECT') {
            const publicDashboard = dashboard.value as PublicDashboardModel;
            if (publicDashboard?.shared) return false;
            return true;
        }
        return false;
    });

    return {
        isManageable,
    };
};
