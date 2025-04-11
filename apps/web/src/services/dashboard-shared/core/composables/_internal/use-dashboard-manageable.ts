import { computed, reactive } from 'vue';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { useDashboardSharedContext } from '@/services/dashboard-shared/core/composables/_internal/use-dashboard-shared-context';


interface UseDashboardManageableReturn {
    getDashboardManageable: (_dashboard?: DashboardModel) => boolean;
    getFolderManageable: (_folder?: FolderModel) => boolean;
}

export const useDashboardManageable = (): UseDashboardManageableReturn => {
    const userStore = useUserStore();
    const appContextStore = useAppContextStore();
    const { entryPoint } = useDashboardSharedContext();
    const isAdminMode = computed(() => appContextStore.getters.isAdminMode);

    const storeState = reactive({
        isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });

    const _isManageable = (isPrivate: boolean, isShared: boolean, resourceGroup: string | undefined): boolean => {
        if (isAdminMode.value) return true;
        if (entryPoint.value === 'DASHBOARDS') {
            if (isPrivate) return true;
            if (isShared && resourceGroup === RESOURCE_GROUP.DOMAIN) return false;
            if (storeState.isWorkspaceOwner) return true;
            return false;
        }
        if (entryPoint.value === 'PROJECT') {
            return !isShared;
        }
        return false;
    };



    const getDashboardManageable = (_dashboard?: DashboardModel): boolean => {
        if (!_dashboard) return false;
        const publicDashboard = _dashboard as PublicDashboardModel;
        return _isManageable(
            _dashboard.dashboard_id?.startsWith('private') || false,
            publicDashboard?.shared || false,
            publicDashboard?.resource_group,
        );
    };

    const getFolderManageable = (_folder?: FolderModel): boolean => {
        if (!_folder) return false;
        const publicFolder = _folder as PublicFolderModel;
        return _isManageable(
            _folder.folder_id?.startsWith('private') || false,
            publicFolder?.shared || false,
            publicFolder?.resource_group,
        );
    };

    return {
        getDashboardManageable,
        getFolderManageable,
    };
};
