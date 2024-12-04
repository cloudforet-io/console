<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PHorizontalLayout, PTab,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import ServiceDetailTabsNotifications from '@/services/alert-manager-v2/components/ServiceDetailTabsNotifications.vue';
import ServiceDetailTabsNotificationsDetailTabs
    from '@/services/alert-manager-v2/components/ServiceDetailTabsNotificationsDetailTabs.vue';
import ServiceDetailTabsOverview from '@/services/alert-manager-v2/components/ServiceDetailTabsOverview.vue';
import ServiceDetailTabsSettings from '@/services/alert-manager-v2/components/ServiceDetailTabsSettings.vue';
import ServiceDetailTabsWebhook from '@/services/alert-manager-v2/components/ServiceDetailTabsWebhook.vue';
import ServiceDetailTabsWebhookDetailTabs
    from '@/services/alert-manager-v2/components/ServiceDetailTabsWebhookDetailTabs.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import type { ServiceDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.SERVICE.OVERVIEW'), name: SERVICE_DETAIL_TABS.OVERVIEW },
        { label: i18n.t('ALERT_MANAGER.WEBHOOK.TITLE'), name: SERVICE_DETAIL_TABS.WEBHOOK },
        { label: i18n.t('ALERT_MANAGER.NOTIFICATIONS.TITLE'), name: SERVICE_DETAIL_TABS.NOTIFICATIONS },
        // { label: i18n.t('ALERT_MANAGER.EVENT_RULE.TITLE'), name: SERVICE_DETAIL_TABS.EVENT_RULE },
        { label: i18n.t('ALERT_MANAGER.SERVICE.SETTINGS'), name: SERVICE_DETAIL_TABS.SETTINGS },
    ])),
    activeTab: SERVICE_DETAIL_TABS.OVERVIEW as ServiceDetailTabsType,
});
const state = reactive({
    selectedWebhook: [],
    selectedNotifications: [],
});
</script>

<template>
    <div>
        <div v-if="tabState.activeTab === SERVICE_DETAIL_TABS.WEBHOOK || tabState.activeTab === SERVICE_DETAIL_TABS.NOTIFICATIONS">
            <p-horizontal-layout :height="522">
                <template #container="{ height }">
                    <p-tab :tabs="tabState.tabs"
                           :active-tab.sync="tabState.activeTab"
                           :style="{ height: `${height}px` }"
                    >
                        <template #webhook>
                            <service-detail-tabs-webhook :selected-item.sync="state.selectedWebhook" />
                        </template>
                        <template #notifications>
                            <service-detail-tabs-notifications :selected-item.sync="state.selectedNotifications" />
                        </template>
                    </p-tab>
                </template>
            </p-horizontal-layout>
            <service-detail-tabs-webhook-detail-tabs v-if="state.selectedWebhook[0]"
                                                     :selected-webhook="state.selectedWebhook[0]"
            />
            <service-detail-tabs-notifications-detail-tabs v-else-if="state.selectedNotifications[0]"
                                                           :selected-notifications="state.selectedNotifications[0]"
            />
        </div>
        <p-tab v-else
               :tabs="tabState.tabs"
               :active-tab.sync="tabState.activeTab"
        >
            <template #overview>
                <service-detail-tabs-overview />
            </template>
            <template #settings>
                <service-detail-tabs-settings />
            </template>
        </p-tab>
    </div>
</template>
