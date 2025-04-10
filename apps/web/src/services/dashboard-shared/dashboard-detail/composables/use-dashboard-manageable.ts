import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useUserStore } from '@/store/user/user-store';

import { useDashboardRouteContext } from '@/services/dashboard-shared/_composables/use-dashboard-route-context';
import { useDashboardGetQuery } from '@/services/dashboard-shared/dashboard-detail/composables/use-dashboard-get-query';

interface UseDashboardManageableOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardManageableReturn {
    isManageable: ComputedRef<boolean>;
    getDashboardManageable: (_dashboard?: DashboardModel) => boolean;
    getFolderManageable: (_folder?: FolderModel) => boolean;
}

export const useDashboardManageable = (options?: UseDashboardManageableOptions): UseDashboardManageableReturn => {
    const userStore = useUserStore();
    const { dashboardId } = options ?? {};

    const { entryPoint } = useDashboardRouteContext();


    const storeState = reactive({
        isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });

    const { dashboard } = useDashboardGetQuery({
        dashboardId: computed(() => dashboardId?.value),
    });

    const isManageable = computed(() => getDashboardManageable(dashboard.value));

    const getDashboardManageable = (_dashboard?: DashboardModel): boolean => {
        if (!_dashboard) return false;
        if (entryPoint.value === 'ADMIN') return true;
        if (entryPoint.value === 'WORKSPACE') {
            if (_dashboard.dashboard_id?.startsWith('private')) return true;
            const publicDashboard = _dashboard as PublicDashboardModel;
            if (publicDashboard?.shared && publicDashboard?.resource_group === RESOURCE_GROUP.DOMAIN) return false;
            if (storeState.isWorkspaceOwner) return true;
            return false;
        }
        if (entryPoint.value === 'PROJECT') {
            const publicDashboard = _dashboard as PublicDashboardModel;
            if (publicDashboard?.shared) return false;
            return true;
        }
        return false;
    };
    const getFolderManageable = (_folder?: FolderModel): boolean => {
        if (!_folder) return false;
        if (entryPoint.value === 'ADMIN') return true;
        if (entryPoint.value === 'WORKSPACE') {
            if (_folder.folder_id?.startsWith('private')) return true;
            const publicFolder = _folder as PublicFolderModel;
            if (publicFolder?.shared && publicFolder?.resource_group === RESOURCE_GROUP.DOMAIN) return false;
            if (storeState.isWorkspaceOwner) return true;
            return false;
        }
        if (entryPoint.value === 'PROJECT') {
            const publicFolder = _folder as PublicFolderModel;
            if (publicFolder?.shared) return false;
            return true;
        }
        return false;
    };


    return {
        isManageable,
        getDashboardManageable,
        getFolderManageable,
    };
};
