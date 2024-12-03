import { WEBHOOK_STATE_COLOR } from '@/services/alert-manager-v2/constants/alert-manager-constant';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const webhookStateFormatter = colorBindFactory(WEBHOOK_STATE_COLOR, (value) => value.toLowerCase());
