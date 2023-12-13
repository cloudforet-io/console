import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/utils';

import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import { USER_MFA_COLOR, USER_STATE_COLOR } from '@/services/administration/constants/user-table-constant';

export const calculateTime = (lastAccessedDay, timezone) => {
    const today = dayjs().toISOString();
    const lastAccessedTime = iso8601Formatter(lastAccessedDay, timezone);
    const todayTime = iso8601Formatter(today, timezone);
    let calculatedTime = dayjs(todayTime).diff(lastAccessedTime, 'day');
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(calculatedTime)) calculatedTime = -1;
    return calculatedTime;
};

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const userStateFormatter = colorBindFactory(USER_STATE_COLOR, (value) => value.toLowerCase());
export const userMfaFormatter = colorBindFactory(USER_MFA_COLOR, (value) => value.toLowerCase());
export const useRoleFormatter = (type: RoleType, isWorkspace?: boolean) => {
    const name = type.toLowerCase().replace(/_/g, ' ').replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());

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
        name: !isWorkspace ? name : 'Owner',
    };
    case ROLE_TYPE.WORKSPACE_MEMBER: return {
        image: WorkspaceMemberImage,
        name: !isWorkspace ? name : 'Member',
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
