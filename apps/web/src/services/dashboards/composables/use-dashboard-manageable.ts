import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';

interface UseDashboardManageableOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardManageableReturn {
    isManageable: ComputedRef<boolean>;
}

export const useDashboardManageable = ({ dashboardId }: UseDashboardManageableOptions): UseDashboardManageableReturn => {
    const appContextStore = useAppContextStore();
    const userStore = useUserStore();
    const route = useRoute();
    const storeState = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });

    const { dashboard } = useDashboardDetailQuery({ dashboardId });

    const isManageable = computed(() => {
        if (storeState.isAdminMode) return true;
        if (dashboard.value?.dashboard_id.startsWith('private')) return true;
        // TODO: implement this condition after project dashboard is implemented
        if (!!route.params.id && !!route.params.dashboardId) return false;
        if (storeState.isWorkspaceOwner) return true;
        return false;
    });

    return {
        isManageable,
    };
};
