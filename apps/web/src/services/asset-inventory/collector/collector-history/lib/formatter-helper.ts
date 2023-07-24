import { i18n } from '@/translations';

import { gray, green, red } from '@/styles/colors';

import { JOB_STATE } from '@/services/asset-inventory/collector/type';

const SUCCESS_ICON_COLOR = green[500];
const CANCELED_ICON_COLOR = gray[400];
const FAILURE_ICON_COLOR = red[400];

export const statusTextFormatter = (status) => {
    if (status === JOB_STATE.SUCCESS) return i18n.t('INVENTORY.COLLECTOR.HISTORY.SUCCESS');
    if (status === JOB_STATE.IN_PROGRESS) return i18n.t('INVENTORY.COLLECTOR.HISTORY.IN_PROGRESS');
    if (status === JOB_STATE.CANCELED) return i18n.t('INVENTORY.COLLECTOR.HISTORY.CANCELED');
    return i18n.t('INVENTORY.COLLECTOR.HISTORY.FAILURE');
};

export const statusTextColorFormatter = (status: string): string | undefined => {
    if (status === JOB_STATE.FAILURE) return FAILURE_ICON_COLOR;
    return undefined;
};
export const statusIconFormatter = (status: string): string => {
    if (status === JOB_STATE.SUCCESS) return 'ic_check';
    if (status === JOB_STATE.IN_PROGRESS) return 'ic_peacock-gradient-circle';
    if (status === JOB_STATE.CANCELED) return 'ic_limit-filled';
    return 'ic_error-filled';
};
export const statusIconColorFormatter = (status: string): string | undefined => {
    if (status === JOB_STATE.SUCCESS) return SUCCESS_ICON_COLOR;
    if (status === JOB_STATE.CANCELED) return CANCELED_ICON_COLOR;
    if (status === JOB_STATE.IN_PROGRESS) return undefined;
    return FAILURE_ICON_COLOR;
};
