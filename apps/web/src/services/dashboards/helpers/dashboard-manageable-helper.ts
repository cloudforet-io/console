import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export const isDashboardOrFolderManageable = (
    isAdminMode: boolean,
    isWorkspaceOwner: boolean,
    isPrivate: boolean,
    isShared?: boolean,
    resourceGroup?: ResourceGroupType,
): boolean => {
    if (isAdminMode) return true;
    if (isPrivate) return true;
    if (isShared && resourceGroup === RESOURCE_GROUP.DOMAIN) return false;
    if (isWorkspaceOwner) return true;
    return false;
};
