<script setup lang="ts">
import {
    computed, onMounted, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PHeadingLayout, PCard, PIconButton, PI,
} from '@cloudforet/mirinae';

import { NOTIFICATION_URGENCY, RECOVERY_MODE } from '@/api-clients/alert-manager/service/schema/constants';
import type { NotificationUrgencyType, RecoveryModeType } from '@/api-clients/alert-manager/service/schema/type';
import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { red } from '@/styles/colors';

import ServiceDetailTabsSettingsEscalationPolicy
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEscalationPolicy.vue';
import ServiceDetailTabsSettingsModal from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsUpdateModal.vue';
import { useEventRuleListQuery } from '@/services/alert-manager/v2/composables/use-event-rule-list-query';
import { useServiceGetQuery } from '@/services/alert-manager/v2/composables/use-service-get-query';
import { SERVICE_SETTING_CARD } from '@/services/alert-manager/v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { ServiceDetailSettingCardType } from '@/services/alert-manager/v2/types/alert-manager-type';

type CardItemType = {
    title: TranslateResult,
    type: ServiceDetailSettingCardType
};
type CardValueInfoType = {
    icon?: string,
    iconColor?: string,
    text: TranslateResult
};

const serviceDetailPageStore = useServiceDetailPageStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const route = useRoute();
const serviceId = computed<string>(() => route.params.serviceId as string);

const { eventRuleListData } = useEventRuleListQuery(serviceId);
const { serviceData } = useServiceGetQuery(serviceId);

const state = reactive({
    selectModalVisible: false,
    modalType: undefined as ServiceDetailSettingCardType|undefined,
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
            title: i18n.t('ALERT_MANAGER.EVENT_RULE.TITLE'),
            type: SERVICE_SETTING_CARD.EVENT_RULE,
        },
    ]),
    notificationPolicy: computed<NotificationUrgencyType>(() => serviceData.value?.options?.notification_urgency || NOTIFICATION_URGENCY.ALL),
    autoRecovery: computed<RecoveryModeType>(() => serviceData.value?.options?.recovery_mode || RECOVERY_MODE.MANUAL),
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
    case NOTIFICATION_URGENCY.ALL: return {
        icon: 'ic_gnb_bell',
        text: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALL_NOTIFICATIONS'),
    };
    case NOTIFICATION_URGENCY.HIGH_ONLY: return {
        icon: 'ic_error-filled',
        iconColor: red[400],
        text: i18n.t('ALERT_MANAGER.NOTIFICATIONS.HIGH_NOTIFICATIONS_ONLY'),
    };
    default: return undefined;
    }
};
const getAutoRecovery = (): CardValueInfoType|undefined => {
    switch (state.autoRecovery) {
    case RECOVERY_MODE.AUTO: return {
        icon: 'ic_automation',
        text: i18n.t('ALERT_MANAGER.ALERTS.AUTO_RESOLVE_ALERTS'),
    };
    case RECOVERY_MODE.MANUAL: return {
        icon: 'ic_edit-text',
        text: i18n.t('ALERT_MANAGER.ALERTS.MANUALLY'),
    };
    default: return undefined;
    }
};
const handleClickEditButton = (type: ServiceDetailSettingCardType) => {
    if (type === SERVICE_SETTING_CARD.EVENT_RULE) {
        replaceUrlQuery({
            mode: 'eventRule',
            escalationPolicyId: undefined,
        });
        return;
    }
    state.selectModalVisible = true;
    state.modalType = type;
};

onMounted(() => {
    if (route.query.escalationPolicyId) {
        serviceDetailPageStore.setSelectedEscalationPolicyId(route.query.escalationPolicyId as string);
    }
});
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
            <div class="cards flex gap-4">
                <p-card v-for="(item, index) in state.settingCardItems"
                        :key="`setting-card-${i18n.locale}-${index}`"
                        :header="false"
                        class="flex-1"
                >
                    <div class="py-3 px-0.5">
                        <div class="flex items-center justify-between mb-6">
                            <span class="text-label-xl">{{ item.title }}</span>
                            <p-icon-button v-if="hasReadWriteAccess || (!hasReadWriteAccess && item.type === SERVICE_SETTING_CARD.EVENT_RULE)"
                                           name="ic_edit"
                                           width="2rem"
                                           height="2rem"
                                           @click="handleClickEditButton(item.type)"
                            />
                        </div>
                        <div class="flex items-center justify-center h-12 bg-gray-100 rounded-md">
                            <div class="flex items-center gap-2">
                                <p-i v-if="item.type !== SERVICE_SETTING_CARD.EVENT_RULE"
                                     class="icon"
                                     :name="getCardValueInfo(item.type)?.icon"
                                     :color="getCardValueInfo(item.type)?.iconColor || 'inherit'"
                                     height="1rem"
                                     width="1rem"
                                />
                                <b v-else>{{ eventRuleListData?.length ?? 0 }}</b>
                                <span class="text-label-md">{{ getCardValueInfo(item.type).text }}</span>
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
            <service-detail-tabs-settings-escalation-policy />
        </div>
        <service-detail-tabs-settings-modal v-if="state.selectModalVisible"
                                            :visible.sync="state.selectModalVisible"
                                            :type="state.modalType"
        />
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings {
    @screen tablet {
        .cards {
            flex-direction: column;
        }
    }
}
</style>
