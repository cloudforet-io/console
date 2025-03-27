import { ALERT_MANAGER_STATE_COLOR } from '@/services/alert-manager/constants/common-constant';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const alertManagerStateFormatter = colorBindFactory(ALERT_MANAGER_STATE_COLOR, (value) => value.toLowerCase());
