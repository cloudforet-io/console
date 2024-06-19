import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

export const getRoleInfo = (type: RoleType): string => {
    switch (type) {
    case ROLE_TYPE.WORKSPACE_OWNER: return WorkspaceOwnerImage;
    case ROLE_TYPE.WORKSPACE_MEMBER: return WorkspaceMemberImage;
    default: return UserImage;
    }
};
