<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import { PButton, PDataLoader } from '@cloudforet/mirinae';

import { EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';

import ServiceDetailTabsSettingsEventRuleCard
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleCard.vue';
import ServiceDetailTabsSettingsEventRuleFormCard
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleFormCard.vue';
import ServiceDetailTabsSettingsEventRuleScopeModal
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleScopeModal.vue';
import ServiceDetailTabsSettingsEventRuleSidebar
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleSidebar.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    modalVisible: computed<boolean>(() => serviceDetailPageState.eventRuleScopeModalVisible),
    items: computed<EventRuleModel[]>(() => serviceDetailPageState.eventRuleList),
    showEventRuleFormCard: computed<boolean>(() => serviceDetailPageState.showEventRuleFormCard),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
});
const state = reactive({
    loading: true,
    selectedScope: EVENT_RULE_SCOPE.GLOBAL,
    selectedWebhook: '',
    hideSidebar: false,
});

const handleClickAddRule = () => {
    serviceDetailPageStore.setEventRuleScopeModalVisible(true);
};

watch(() => storeState.serviceId, async (id) => {
    if (!id) return;
    try {
        state.loading = true;
        await serviceDetailPageStore.fetchEventRuleList({
            service_id: storeState.serviceId,
        });
    } finally {
        state.loading = false;
    }
}, { immediate: true });

onUnmounted(() => {
    serviceDetailPageStore.initEscalationPolicyState();
});
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule pt-6 pb-10">
        <p-data-loader :loading="state.loading"
                       :data="!storeState.showEventRuleFormCard ? storeState.items : true"
                       class="loader"
        >
            <div class="content-wrapper flex gap-6">
                <service-detail-tabs-settings-event-rule-sidebar :hide-sidebar.sync="state.hideSidebar"
                                                                 :items="storeState.items"
                />
                <service-detail-tabs-settings-event-rule-form-card v-if="storeState.showEventRuleFormCard"
                                                                   :selected-webhook="storeState.isEventRuleEditMode ? storeState.eventRuleInfo.webhook_id : state.selectedWebhook"
                                                                   :selected-scope="storeState.isEventRuleEditMode ? storeState.eventRuleInfo.scope : state.selectedScope"
                                                                   class="flex-1"
                />
                <service-detail-tabs-settings-event-rule-card v-else-if="storeState.eventRuleInfo.event_rule_id"
                                                              class="flex-1"
                />
            </div>
            <template #no-data>
                <div class="w-full flex flex-col items-center justify-center gap-6 pt-10 pb-10 border border-gray-300 rounded-xl">
                    <p class="text-label-xl text-gray-900">
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_TITLE') }}
                    </p>
                    <p class="text-paragraph-md text-gray-500 whitespace-pre-wrap text-center">
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_HELP_TEXT') }}
                    </p>
                    <p-button icon-left="ic_plus_bold"
                              class="self-start mx-auto"
                              @click="handleClickAddRule"
                    >
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_ADD_RULE') }}
                    </p-button>
                </div>
            </template>
        </p-data-loader>
        <service-detail-tabs-settings-event-rule-scope-modal v-if="storeState.modalVisible"
                                                             :visible="storeState.modalVisible"
                                                             :scope.sync="state.selectedScope"
                                                             :selected-webhook.sync="state.selectedWebhook"
        />
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule {
    .loader {
        min-height: 14rem;
    }
    .content-wrapper {
        align-items: flex-start;
    }
}
</style>
