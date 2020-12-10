import { userStateColor } from '@/views/identity/user/lib/config';

const colorBindFactory = (colorMapping, textFnc) => value => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const userStateFormatter = colorBindFactory(userStateColor, value => value.toLowerCase());
