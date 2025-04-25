import { computed } from 'vue';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

export const useUserInfo = () => {
    const userReferenceStore = useUserReferenceStore();
    const userItems = computed(() => userReferenceStore.getters.userItems);
    const ROLE_INFO_MAP = {
        [ROLE_TYPE.SYSTEM_ADMIN]: { icon: SystemAdminImage, label: 'System Admin' },
        [ROLE_TYPE.DOMAIN_ADMIN]: { icon: DomainAdminImage, label: 'Domain Admin' },
        [ROLE_TYPE.WORKSPACE_OWNER]: { icon: WorkspaceOwnerImage, label: 'Workspace Owner' },
        [ROLE_TYPE.WORKSPACE_MEMBER]: { icon: WorkspaceMemberImage, label: 'Workspace Member' },
        [ROLE_TYPE.USER]: { icon: UserImage, label: 'User' },
    } as const;
    const getUserIcon = (userId: string): string => {
        const roleType = userItems.value[userId]?.data.roleInfo?.role_type;
        return roleType ? ROLE_INFO_MAP[roleType]?.icon : UserImage;
    };
    const getUserName = (userId: string): string|undefined => userItems.value[userId]?.name;
    const getUserLabel = (userId: string): string|undefined => userItems.value[userId]?.label;
    const getUserRole = (userId: string): string|undefined => {
        const roleType = userItems.value[userId]?.data.roleInfo?.role_type;
        return roleType ? ROLE_INFO_MAP[roleType]?.label : undefined;
    };

    return {
        getUserIcon,
        getUserName,
        getUserLabel,
        getUserRole,
    };
};
