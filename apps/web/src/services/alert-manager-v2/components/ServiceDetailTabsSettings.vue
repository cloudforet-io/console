<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PHeading, PHeadingLayout, PCard, PIconButton, PI,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { red } from '@/styles/colors';

import ServiceDetailTabsSettingsEscalationPolicy
    from '@/services/alert-manager-v2/components/ServiceDetailTabsSettingsEscalationPolicy.vue';
import { SERVICE_SETTING_CARD } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import type { ServiceDetailSettingCardType } from '@/services/alert-manager-v2/types/alert-manager-type';

type CardItemType = {
    title: TranslateResult,
    type: ServiceDetailSettingCardType
};
type CardValueInfoType = {
    icon?: string,
    text: TranslateResult
};
const state = reactive({
    settingCardItems: computed<CardItemType[]>(() => [
        {
            title: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFICATION_POLICY'),
            type: SERVICE_SETTING_CARD.NOTIFICATION_POLICY,
        },
        {
            title: i18n.t('ALERT_MANAGER.ALERTS.AUTO_RECOVERY'),
            type: SERVICE_SETTING_CARD.AUTO_RECOVERY,
        },
        {
            title: i18n.t('ALERT_MANAGER.EVENT_RULE.RULE_SET'),
            type: SERVICE_SETTING_CARD.RULE_SET,
        },
    ]),
    // TODO: temp data
    notificationPolicy: 'ALL',
    autoRecovery: 'MANUAL',
    ruleSet: 3,
});

const getCardValueInfo = (type: ServiceDetailSettingCardType): CardValueInfoType|undefined => {
    if (type === SERVICE_SETTING_CARD.NOTIFICATION_POLICY) return getNotificationPolicy();
    if (type === SERVICE_SETTING_CARD.AUTO_RECOVERY) return getAutoRecovery();
    return {
        text: i18n.t('ALERT_MANAGER.EVENT_RULE.RULES_ON_THIS_PROJECT'),
    };
};
const getNotificationPolicy = (): CardValueInfoType|undefined => {
    switch (state.notificationPolicy) {
    case 'ALL': return {
        icon: 'ic_gnb_bell',
        text: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALL_NOTIFICATIONS'),
    };
    case 'HIGH_ONLY': return {
        icon: 'ic_error-filled',
        text: i18n.t('ALERT_MANAGER.NOTIFICATIONS.HIGH_NOTIFICATIONS_ONLY'),
    };
    default: return undefined;
    }
};
const getAutoRecovery = (): CardValueInfoType|undefined => {
    switch (state.autoRecovery) {
    case 'AUTO': return {
        icon: 'ic_automation',
        text: i18n.t('ALERT_MANAGER.ALERTS.AUTO_RESOLVE_ALERTS'),
    };
    case 'MANUAL': return {
        icon: 'ic_edit-text',
        text: i18n.t('ALERT_MANAGER.ALERTS.MANUALLY'),
    };
    default: return undefined;
    }
};
const handleClickEditButton = () => {
    console.log('TODO: handleClickEditButton');
};
</script>

<template>
    <div class="service-detail-tabs-settings">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.SERVICE.SETTINGS')"
                />
            </template>
        </p-heading-layout>
        <div class="p-4 mx-4 bg-blue-100 rounded-lg">
            <div class="flex gap-4">
                <p-card v-for="(item, index) in state.settingCardItems"
                        :key="`setting-card-${index}`"
                        :header="false"
                        class="flex-1"
                >
                    <div class="py-3 px-0.5">
                        <div class="flex items-center justify-between mb-6">
                            <span class="text-label-xl">{{ item.title }}</span>
                            <p-icon-button name="ic_edit"
                                           width="2rem"
                                           height="2rem"
                                           @click="handleClickEditButton"
                            />
                        </div>
                        <div class="flex items-center justify-center h-12 bg-gray-100 rounded-md">
                            <div class="flex items-center gap-2">
                                <p-i v-if="item.type !== SERVICE_SETTING_CARD.RULE_SET"
                                     class="icon"
                                     :name="getCardValueInfo(item.type)?.icon"
                                     :color="getCardValueInfo(item.type)?.text === 'HIGH_ONLY' ? red[400] : 'inherit'"
                                     height="1rem"
                                     width="1rem"
                                />
                                <b v-else>{{ state.ruleSet }}</b>
                                <span>{{ getCardValueInfo(item.type).text }}</span>
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
            <service-detail-tabs-settings-escalation-policy />
        </div>
    </div>
</template>
