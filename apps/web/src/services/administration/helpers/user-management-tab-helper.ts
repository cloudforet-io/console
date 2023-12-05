import type { RoleType } from '@/schema/identity/role/type';

import {
    pluginStateColor,
    USER_MFA_COLOR,
    userStateColor,
} from '@/services/administration/constants/user-table-constant';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const userStateFormatter = colorBindFactory(userStateColor, (value) => value.toLowerCase());
export const userMfaFormatter = colorBindFactory(USER_MFA_COLOR, (value) => value.toLowerCase());
export const userRoleFormatter = (value: RoleType) => {
    let image;
    if (value === 'DOMAIN_ADMIN') {
        image = 'img_avatar_admin';
    } else if (value === 'WORKSPACE_OWNER') {
        image = 'img_avatar_workspace-owner';
    } else {
        image = 'img_avatar_workspace-member_no-role';
    }

    return {
        image,
        name: value.toLowerCase().replace(/_/g, ' ').replace(/(?:^|\s)\w/g, (match) => match.toUpperCase()),
    };
};
export const pluginStateFormatter = colorBindFactory(pluginStateColor, (value) => value);
