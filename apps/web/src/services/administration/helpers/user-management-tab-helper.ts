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
export const pluginStateFormatter = colorBindFactory(pluginStateColor, (value) => value);
