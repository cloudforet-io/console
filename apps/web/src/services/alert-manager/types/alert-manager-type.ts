import type { TranslateResult } from 'vue-i18n';

import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { AlertStatusType, AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import type { EventRuleConditionsPolicyType } from '@/schema/alert-manager/event-rule/type';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { AlertsInfoType, AlertsType } from '@/schema/alert-manager/service/type';

import type {
    SERVICE_DETAIL_TABS,
    WEBHOOK_DETAIL_TABS,
    SERVICE_SETTING_CARD,
} from '@/services/alert-manager/constants/common-constant';

export type ServiceDetailTabsType = typeof SERVICE_DETAIL_TABS[keyof typeof SERVICE_DETAIL_TABS];
export type ServiceDetailSettingCardType = typeof SERVICE_SETTING_CARD[keyof typeof SERVICE_SETTING_CARD];

export type WebhookDetailTabsType = typeof WEBHOOK_DETAIL_TABS[keyof typeof WEBHOOK_DETAIL_TABS];
export type WebhookModalType = 'UPDATE' | 'ENABLE' | 'DISABLE' | 'DELETE';

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
export type SettingModeType = 'eventRule' | 'settings';

export type CreatedNotificationInfoType = {
    name?: string;
    data?: ServiceChannelDataType|Record<string, any>;
    schedule?: ServiceChannelScheduleInfoType;
};
export type UserRadioType = {
    label: TranslateResult,
    name: 'ALL_MEMBER' | 'USER' | 'USER_GROUP'
};
export type ProtocolInfo = {
    name: string|TranslateResult;
    icon: string;
    schema?: JsonSchema;
};
export type NotificationsModalType = 'UPDATE' | 'ENABLE' | 'DISABLE' | 'DELETE';
export interface ProtocolCardItemType extends Partial<NotificationProtocolModel> {
    icon?: string;
}

export type EscalationPolicyRadioType = {
    label: TranslateResult,
    name: AlertStatusType
};
export type EscalationPolicyModalType = 'CREATE' | 'UPDATE' | 'STATE' | 'DELETE';

export type EventRuleConditionPolicyButtonType = {
    label: TranslateResult,
    name: EventRuleConditionsPolicyType
};
