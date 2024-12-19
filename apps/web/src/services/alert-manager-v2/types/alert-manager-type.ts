import type { TranslateResult } from 'vue-i18n';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';
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

export type AlertFilterType = {
    label: TranslateResult;
    name: string;
};
export type AlertUrgencyRadioType = {
    label: TranslateResult,
    name: AlertUrgencyType
};
export type AlertManagementTableHandlerType = {
    keyItemSets: KeyItemSet[],
    valueHandlerMap: ValueHandlerMap
};

export type createHeaderInfoByStep = {
    title: TranslateResult;
    desc?: TranslateResult;
};

export interface Service extends ServiceModel {
    alerts: Record<AlertsType, AlertsInfoType>;
}

export type CreatedNotificationInfoType = {
    name?: string;
    data?: ServiceChannelDataType;
    schedule?: ServiceChannelScheduleInfoType;
};
export type UserRadioType = {
    label: TranslateResult,
    name: 'ALL_MEMBER' | 'USER' | 'USER_GROUP'
};
