<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHorizontalLayout, PTab,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ServiceDetailTabsAlert from '@/services/alert-manager/v2/components/ServiceDetailTabsAlert.vue';
import ServiceDetailTabsNotifications from '@/services/alert-manager/v2/components/ServiceDetailTabsNotifications.vue';
import ServiceDetailTabsNotificationsDetail
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsDetail.vue';
import ServiceDetailTabsOverview from '@/services/alert-manager/v2/components/ServiceDetailTabsOverview.vue';
import ServiceDetailTabsSettingsContainer from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsContainer.vue';
import ServiceDetailTabsWebhook from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhook.vue';
import ServiceDetailTabsWebhookDetail
    from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhookDetail.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { ServiceDetailTabsType } from '@/services/alert-manager/v2/types/alert-manager-type';

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
    activeTab: undefined as ServiceDetailTabsType|undefined,
});
const storeState = reactive({
    currentTab: computed<ServiceDetailTabsType|undefined>(() => serviceDetailPageState.currentTab),
    selectedWebhookId: computed<string|undefined>(() => serviceDetailPageState.selectedWebhookId),
    selectedNotificationId: computed<string|undefined>(() => serviceDetailPageState.selectedNotificationId),
});
const state = reactive({
    isSettingMode: computed<boolean>(() => route.query?.mode !== 'eventRule'),
});

watch(() => route.query.tab, (tab) => {
    if (tab) {
        tabState.activeTab = tab as ServiceDetailTabsType;
    } else {
        tabState.activeTab = SERVICE_DETAIL_TABS.OVERVIEW;
    }
}, { immediate: true });
watch(() => storeState.currentTab, async (currentTab) => {
    if (!currentTab) return;
    tabState.activeTab = currentTab;
});
watch(() => tabState.activeTab, (activeTab) => {
    replaceUrlQuery({
        tab: activeTab,
        urgency: activeTab !== SERVICE_DETAIL_TABS.ALERTS ? undefined : route.query?.urgency,
        status: activeTab !== SERVICE_DETAIL_TABS.ALERTS ? undefined : route.query?.status,
        mode: activeTab !== SERVICE_DETAIL_TABS.SETTINGS ? undefined : route.query?.mode,
        webhookId: activeTab !== SERVICE_DETAIL_TABS.SETTINGS ? undefined : route.query?.webhookId,
        eventRuleId: activeTab !== SERVICE_DETAIL_TABS.SETTINGS ? undefined : route.query?.eventRuleId,
        escalationPolicyId: activeTab !== SERVICE_DETAIL_TABS.SETTINGS ? undefined : route.query?.escalationPolicyId,
    });
});
</script>

<template>
    <div class="service-detail-tabs">
        <div v-if="tabState.activeTab === SERVICE_DETAIL_TABS.WEBHOOK || tabState.activeTab === SERVICE_DETAIL_TABS.NOTIFICATIONS"
             class="horizontal-tab"
        >
            <p-horizontal-layout :height="522">
                <template #container="{ height }">
                    <p-tab :key="i18n.locale"
                           :tabs="tabState.tabs"
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
            <service-detail-tabs-webhook-detail v-if="tabState.activeTab === SERVICE_DETAIL_TABS.WEBHOOK && storeState.selectedWebhookId" />
            <service-detail-tabs-notifications-detail v-else-if="tabState.activeTab === SERVICE_DETAIL_TABS.NOTIFICATIONS && storeState.selectedNotificationId" />
        </div>
        <p-tab v-else
               :key="i18n.locale"
               :tabs="tabState.tabs"
               :active-tab.sync="tabState.activeTab"
               class="tab"
               :class="{'event-rule': !state.isSettingMode}"
        >
            <template #overview>
                <service-detail-tabs-overview />
            </template>
            <template #alerts>
                <service-detail-tabs-alert />
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
