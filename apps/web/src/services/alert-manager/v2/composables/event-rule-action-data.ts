import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import { EVENT_RULE_SETTINGS_TYPE } from '@/services/alert-manager/v2/constants/common-constant';
import type { EventRuleSettingsType } from '@/services/alert-manager/v2/types/alert-manager-type';

type EventRuleActionValue = {
    type: EventRuleSettingsType;
    label: TranslateResult;
    name: string;
};
type EventRuleActionsSettingMap = Record<string, EventRuleActionValue>;

export const getActionSettingTypeI18n = (): ComputedRef<Record<EventRuleSettingsType, TranslateResult>> => computed(() => ({
    service: i18n.t('ALERT_MANAGER.EVENT_RULE.SERVICE_SETTINGS'),
    asset: i18n.t('ALERT_MANAGER.EVENT_RULE.ASSET_SETTINGS'),
    alert: i18n.t('ALERT_MANAGER.EVENT_RULE.ALERT_SETTINGS'),
}));
export const getActionSettingI18n = (): ComputedRef<EventRuleActionsSettingMap> => computed(() => ({
    change_service: {
        type: EVENT_RULE_SETTINGS_TYPE.SERVICE,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_SERVICE'),
        name: 'change_service',
    },

    match_asset: {
        type: EVENT_RULE_SETTINGS_TYPE.ASSET,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.MATCH_ASSET'),
        name: 'match_asset',
    },

    merge_asset_labels: {
        type: EVENT_RULE_SETTINGS_TYPE.ASSET,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.MERGE_ASSET_LABELS'),
        name: 'merge_asset_labels',
    },

    change_title: {
        type: EVENT_RULE_SETTINGS_TYPE.ALERT,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_TITLE'),
        name: 'change_title',
    },
    change_urgency: {
        type: EVENT_RULE_SETTINGS_TYPE.ALERT,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_URGENCY'),
        name: 'change_urgency',
    },
    change_escalation_policy: {
        type: EVENT_RULE_SETTINGS_TYPE.ALERT,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_ESCALATION_POLICY'),
        name: 'change_escalation_policy',
    },
    add_additional_info: {
        type: EVENT_RULE_SETTINGS_TYPE.ALERT,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.ADD_ADDITIONAL_INFO'),
        name: 'add_additional_info',
    },
    change_status: {
        type: EVENT_RULE_SETTINGS_TYPE.ALERT,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_STATUS'),
        name: 'change_status',
    },
    set_labels: {
        type: EVENT_RULE_SETTINGS_TYPE.ALERT,
        label: i18n.t('ALERT_MANAGER.EVENT_RULE.ADD_LABELS'),
        name: 'set_labels',
    },
}));
