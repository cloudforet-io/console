<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PButton, PDataLoader, screens } from '@cloudforet/mirinae';

import { EVENT_RULE_SCOPE } from '@/api-clients/alert-manager/event-rule/schema/constants';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import ServiceDetailTabsSettingsEventRuleCard
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleCard.vue';
import ServiceDetailTabsSettingsEventRuleFormCard
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleFormCard.vue';
import ServiceDetailTabsSettingsEventRuleScopeModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleScopeModal.vue';
import ServiceDetailTabsSettingsEventRuleSidebar
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleSidebar.vue';
import { useEventRuleGetQuery } from '@/services/alert-manager/v2/composables/use-event-rule-get-query';
import { useEventRuleListQuery } from '@/services/alert-manager/v2/composables/use-event-rule-list-query';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const route = useRoute();
const serviceId = computed<string>(() => route.params.serviceId as string);

const { hasReadWriteAccess } = usePageEditableStatus();
const { width } = useWindowSize();

const { eventRuleData } = useEventRuleGetQuery();
const { eventRuleListData, eventRuleListFetching } = useEventRuleListQuery(serviceId.value);

const storeState = reactive({
    modalVisible: computed<boolean>(() => serviceDetailPageState.eventRuleScopeModalVisible),
    showEventRuleFormCard: computed<boolean>(() => serviceDetailPageState.showEventRuleFormCard),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    loading: true,
    selectedScope: EVENT_RULE_SCOPE.WEBHOOK,
    selectedWebhook: '',
    hideSidebar: false,
});

const handleClickAddRule = () => {
    serviceDetailPageStore.setEventRuleScopeModalVisible(true);
};

onUnmounted(() => {
    serviceDetailPageStore.initEscalationPolicyState();
});
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule pt-6 pb-10 relative">
        <p-data-loader :loading="eventRuleListFetching"
                       :data="!storeState.showEventRuleFormCard ? eventRuleListData : true"
                       class="loader"
        >
            <div class="content-wrapper flex gap-6">
                <service-detail-tabs-settings-event-rule-sidebar v-if="!state.isMobileSize"
                                                                 :hide-sidebar.sync="state.hideSidebar"
                />
                <service-detail-tabs-settings-event-rule-form-card v-if="storeState.showEventRuleFormCard"
                                                                   :selected-webhook="storeState.isEventRuleEditMode ? eventRuleData?.webhook_id : state.selectedWebhook"
                                                                   :selected-scope="storeState.isEventRuleEditMode ? eventRuleData?.scope : state.selectedScope"
                                                                   class="flex-1"
                />
                <service-detail-tabs-settings-event-rule-card v-else-if="eventRuleData?.event_rule_id"
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
                    <p-button v-if="hasReadWriteAccess"
                              icon-left="ic_plus_bold"
                              class="self-start mx-auto"
                              @click="handleClickAddRule"
                    >
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_ADD_RULE') }}
                    </p-button>
                </div>
            </template>
        </p-data-loader>
        <service-detail-tabs-settings-event-rule-sidebar v-if="state.isMobileSize"
                                                         :hide-sidebar.sync="state.hideSidebar"
        />
        <service-detail-tabs-settings-event-rule-scope-modal v-if="hasReadWriteAccess && storeState.modalVisible"
                                                             :visible="hasReadWriteAccess && storeState.modalVisible"
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
