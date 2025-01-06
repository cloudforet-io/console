<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual } from 'lodash';

import {
    PHorizontalLayout, PTab,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import AlertsManagementTable from '@/services/alert-manager/components/AlertsManagementTable.vue';
import ServiceDetailTabsNotifications from '@/services/alert-manager/components/ServiceDetailTabsNotifications.vue';
import ServiceDetailTabsNotificationsDetailTabs
    from '@/services/alert-manager/components/ServiceDetailTabsNotificationsDetailTabs.vue';
import ServiceDetailTabsOverview from '@/services/alert-manager/components/ServiceDetailTabsOverview.vue';
import ServiceDetailTabsSettingsContainer from '@/services/alert-manager/components/ServiceDetailTabsSettingsContainer.vue';
import ServiceDetailTabsWebhook from '@/services/alert-manager/components/ServiceDetailTabsWebhook.vue';
import ServiceDetailTabsWebhookDetailTabs
    from '@/services/alert-manager/components/ServiceDetailTabsWebhookDetailTabs.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { ServiceDetailTabsType, SettingModeType } from '@/services/alert-manager/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const route = useRoute();

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.SERVICE.OVERVIEW'), name: SERVICE_DETAIL_TABS.OVERVIEW },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TITLE'), name: SERVICE_DETAIL_TABS.ALERTS },
        { label: i18n.t('ALERT_MANAGER.WEBHOOK.TITLE'), name: SERVICE_DETAIL_TABS.WEBHOOK },
        { label: i18n.t('ALERT_MANAGER.NOTIFICATIONS.TITLE'), name: SERVICE_DETAIL_TABS.NOTIFICATIONS },
        { label: i18n.t('ALERT_MANAGER.SERVICE.SETTINGS'), name: SERVICE_DETAIL_TABS.SETTINGS },
    ])),
    activeTab: SERVICE_DETAIL_TABS.OVERVIEW as ServiceDetailTabsType,
});
const storeState = reactive({
    currentTab: computed<ServiceDetailTabsType>(() => serviceDetailPageState.currentTab),
    selectedWebhookId: computed<string|undefined>(() => serviceDetailPageState.selectedWebhookId),
    selectedNotificationId: computed<string|undefined>(() => serviceDetailPageState.selectedNotificationId),
    settingMode: computed<SettingModeType>(() => serviceDetailPageState.settingMode),
});

watch(() => tabState.activeTab, (activeTab) => {
    serviceDetailPageStore.setCurrentTab(activeTab);
    serviceDetailPageStore.setSettingMode('settings');
    replaceUrlQuery({
        tab: activeTab,
        status: undefined,
        urgency: undefined,
    });
});
watch(() => storeState.currentTab, (currentTab) => {
    if (isEqual(tabState.activeTab, currentTab)) return;
    tabState.activeTab = currentTab;
});

onMounted(() => {
    if (route.query.tab) {
        tabState.activeTab = route.query.tab as ServiceDetailTabsType;
    } else {
        tabState.activeTab = SERVICE_DETAIL_TABS.OVERVIEW;
    }
});
</script>

<template>
    <div class="service-detail-tabs">
        <div v-if="tabState.activeTab === SERVICE_DETAIL_TABS.WEBHOOK || tabState.activeTab === SERVICE_DETAIL_TABS.NOTIFICATIONS"
             class="horizontal-tab"
        >
            <p-horizontal-layout :height="522">
                <template #container="{ height }">
                    <p-tab :tabs="tabState.tabs"
                           :active-tab.sync="tabState.activeTab"
                           class="tab"
                           :style="{ height: `${height}px` }"
                    >
                        <template #webhook>
                            <service-detail-tabs-webhook :table-height="height" />
                        </template>
                        <template #notifications>
                            <service-detail-tabs-notifications :table-height="height" />
                        </template>
                    </p-tab>
                </template>
            </p-horizontal-layout>
            <service-detail-tabs-webhook-detail-tabs v-if="tabState.activeTab === SERVICE_DETAIL_TABS.WEBHOOK && storeState.selectedWebhookId" />
            <service-detail-tabs-notifications-detail-tabs v-else-if="tabState.activeTab === SERVICE_DETAIL_TABS.NOTIFICATIONS && storeState.selectedNotificationId" />
        </div>
        <p-tab v-else
               :tabs="tabState.tabs"
               :active-tab.sync="tabState.activeTab"
               class="tab"
               :class="{'event-rule': storeState.settingMode === 'eventRule'}"
        >
            <template #overview>
                <service-detail-tabs-overview />
            </template>
            <template #alerts>
                <alerts-management-table />
            </template>
            <template #settings>
                <service-detail-tabs-settings-container />
            </template>
        </p-tab>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs {
    .horizontal-tab {
        .tab {
            min-height: 32.625rem;
        }
    }
    .tab {
        &.event-rule {
            @apply bg-transparent border-none;
        }
    }
}

/* custom design-system component - p-horizontal-layout */
:deep(.p-horizontal-layout) {
    .horizontal-contents {
        min-height: 32.625rem;
        overflow: unset;
    }
}
</style>
