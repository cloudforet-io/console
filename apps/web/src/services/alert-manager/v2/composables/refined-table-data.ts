import { SERVICE_CHANNEL_FORWARD_TYPE } from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelDataType } from '@/schema/alert-manager/service-channel/type';
import { i18n } from '@/translations';

import { ALERT_MANAGER_STATE_COLOR } from '@/services/alert-manager/v2/constants/common-constant';
import type { ProtocolCardItemType, ProtocolInfo } from '@/services/alert-manager/v2/types/alert-manager-type';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const alertManagerStateFormatter = colorBindFactory(ALERT_MANAGER_STATE_COLOR, (value) => value.toLowerCase());

export const getProtocolInfo = (id: string, list: ProtocolCardItemType[], data?: ServiceChannelDataType): ProtocolInfo => {
    if (id === 'forward') {
        if (data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.ALL_MEMBER) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_ALL_MEMBER') };
        }
        if (data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.USER_GROUP) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_USER_GROUP') };
        }
        if (data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.USER) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_USER') };
        }
        return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ASSOCIATED_MEMBER') };
    }
    const protocol = list.find((item) => item.protocol_id === id);
    return {
        name: protocol?.name || '',
        icon: protocol?.icon || '',
    };
};
