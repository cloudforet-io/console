<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHorizontalLayout, PTab,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ServiceDetailTabsNotifications from '@/services/alert-manager-v2/components/ServiceDetailTabsNotifications.vue';
import ServiceDetailTabsNotificationsDetailTabs
    from '@/services/alert-manager-v2/components/ServiceDetailTabsNotificationsDetailTabs.vue';
import ServiceDetailTabsOverview from '@/services/alert-manager-v2/components/ServiceDetailTabsOverview.vue';
import ServiceDetailTabsSettings from '@/services/alert-manager-v2/components/ServiceDetailTabsSettings.vue';
import ServiceDetailTabsWebhook from '@/services/alert-manager-v2/components/ServiceDetailTabsWebhook.vue';
import ServiceDetailTabsWebhookDetailTabs
    from '@/services/alert-manager-v2/components/ServiceDetailTabsWebhookDetailTabs.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';
import type { ServiceDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const route = useRoute();

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
const storeState = reactive({
    currentTab: computed<ServiceDetailTabsType>(() => serviceDetailPageState.currentTab),
});
const state = reactive({
    selectedWebhook: undefined,
    selectedNotifications: [],
});

watch(() => tabState.activeTab, (activeTab) => {
    serviceDetailPageStore.setCurrentTab(activeTab);
    replaceUrlQuery('tab', activeTab);
});
watch(() => storeState.currentTab, (currentTab) => {
    tabState.activeTab = currentTab;
});

onMounted(() => {
    if (route.query.tab) {
        serviceDetailPageStore.setCurrentTab(route.query.tab as ServiceDetailTabsType);
    } else {
        serviceDetailPageStore.setCurrentTab(SERVICE_DETAIL_TABS.OVERVIEW);
    }
});

onUnmounted(() => {
    serviceDetailPageStore.initState();
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
