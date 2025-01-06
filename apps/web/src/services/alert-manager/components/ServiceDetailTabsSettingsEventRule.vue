<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EventRuleListParameters } from '@/schema/alert-manager/event-rule/api-verbs/list';
import { EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

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
});
const state = reactive({
    loading: true,
    items: [] as EventRuleModel[],
    selectedScope: EVENT_RULE_SCOPE.GLOBAL,
    selectedWebhook: '',
    hideSidebar: false,
});
const modalState = reactive({
    visible: false,
    showFormCard: false,
});

const handleClickAddRule = () => {
    modalState.visible = true;
};

const fetchEventRuleList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.eventRule.list<EventRuleListParameters, ListResponse<EventRuleModel>>({
            service_id: storeState.serviceId,
        });
        state.items = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.serviceId, (id) => {
    if (!id) return;
    fetchEventRuleList();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule pt-6 pb-10">
        <div v-if="state.items.length === 0 && !modalState.showFormCard"
             class="w-full flex flex-col items-center justify-center gap-6 pt-10 pb-10 border border-gray-300 rounded-xl"
        >
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
        <div v-else
             class="flex gap-1"
        >
            <service-detail-tabs-settings-event-rule-sidebar v-if="state.items.length > 0"
                                                             :hide-sidebar.sync="state.hideSidebar"
                                                             :items="state.items"
            />
            <service-detail-tabs-settings-event-rule-form-card :selected-webhook="state.selectedWebhook"
                                                               :selected-scope="state.selectedScope"
                                                               class="flex-1"
            />
        </div>
        <service-detail-tabs-settings-event-rule-scope-modal v-if="modalState.visible"
                                                             :visible.sync="modalState.visible"
                                                             :scope.sync="state.selectedScope"
                                                             :selected-webhook.sync="state.selectedWebhook"
                                                             :show-form-card.sync="modalState.showFormCard"
        />
    </div>
</template>
