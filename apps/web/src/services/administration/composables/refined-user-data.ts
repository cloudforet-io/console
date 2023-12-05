import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/utils';

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
export const userRoleFormatter = (value: RoleType) => {
    let image;
    if (value === 'DOMAIN_ADMIN') {
        image = 'img_avatar_admin';
    } else if (value === 'WORKSPACE_OWNER') {
        image = 'img_avatar_project-admin';
    } else {
        image = 'img_avatar_user';
    }

    return {
        image,
        name: value.toLowerCase().replace(/_/g, ' ').replace(/(?:^|\s)\w/g, (match) => match.toUpperCase()),
    };
};
