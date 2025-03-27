

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { i18n } from '@/translations';

import { WORKSPACE_STATE_COLOR } from '@/services/advanced/constants/workspace-constant';
import { USER_STATE_COLOR } from '@/services/iam/constants/user-constant';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const workspaceStateFormatter = colorBindFactory(WORKSPACE_STATE_COLOR, (value) => value?.toLowerCase());
export const groupUserStateFormatter = colorBindFactory(USER_STATE_COLOR, (value) => value?.toLowerCase());

export const useRoleFormatter = (type: RoleType, isWorkspace?: boolean) => {
    const name = type?.toLowerCase().replace(/_/g, ' ').replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());

    switch (type) {
    case ROLE_TYPE.SYSTEM_ADMIN: return {
        image: SystemAdminImage,
        name,
    };
    case ROLE_TYPE.DOMAIN_ADMIN: return {
        image: DomainAdminImage,
        name: 'Admin',
    };
    case ROLE_TYPE.WORKSPACE_OWNER: return {
        image: WorkspaceOwnerImage,
        name: !isWorkspace ? name : i18n.t('IAM.USER.FORM.OWNER'),
    };
    case ROLE_TYPE.WORKSPACE_MEMBER: return {
        image: WorkspaceMemberImage,
        name: !isWorkspace ? name : i18n.t('IAM.USER.FORM.MEMBER'),
    };
    case ROLE_TYPE.USER: return {
        image: UserImage,
        name: '--',
    };
    default: return {
        image: UserImage,
        name: '',
    };
    }
};

export const getWorkspaceInfo = (id: string, workspaceList: WorkspaceModel[]): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return workspaceList.find((i) => i.workspace_id === id);
};
