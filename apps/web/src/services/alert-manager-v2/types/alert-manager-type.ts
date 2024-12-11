import type { TranslateResult } from 'vue-i18n';

import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { AlertsInfoType, AlertsType } from '@/schema/alert-manager/service/type';

import type {
    SERVICE_DETAIL_TABS,
    WEBHOOK_DETAIL_TABS,
    SERVICE_SETTING_CARD,
} from '@/services/alert-manager-v2/constants/alert-manager-constant';

export type ServiceDetailTabsType = typeof SERVICE_DETAIL_TABS[keyof typeof SERVICE_DETAIL_TABS];
export type ServiceDetailSettingCardType = typeof SERVICE_SETTING_CARD[keyof typeof SERVICE_SETTING_CARD];

export type WebhookDetailTabsType = typeof WEBHOOK_DETAIL_TABS[keyof typeof WEBHOOK_DETAIL_TABS];

export type createHeaderInfoByStep = {
    title: TranslateResult;
    desc?: TranslateResult;
};

export interface Service extends ServiceModel {
    alerts: Record<AlertsType, AlertsInfoType>;
}
