<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataLoader, PButton } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EventRuleListParameters } from '@/schema/alert-manager/event-rule/api-verbs/list';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type { EventRuleScopeType } from '@/schema/alert-manager/event-rule/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceDetailTabsSettingsEventRuleScopeModal
    from '@/services/alert-manager/components/ServiceDetailTabsSettingsEventRuleScopeModal.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
});
const state = reactive({
    loading: true,
    items: [] as EventRuleModel[],
    selectedScope: undefined as EventRuleScopeType|undefined,
    selectedWebhook: '',
});
const modalState = reactive({
    visible: false,
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
        <p-data-loader :loading="state.loading"
                       :data="true"
        >
            {{ state.items }}
            <template #no-data>
                <div class="w-full flex flex-col gap-6 pt-10 pb-10 border border-gray-300 rounded-xl">
                    <p class="text-label-xl text-gray-900">
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_TITLE') }}
                    </p>
                    <p class="text-paragraph-md text-gray-500 whitespace-pre-wrap">
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
        <service-detail-tabs-settings-event-rule-scope-modal v-if="modalState.visible"
                                                             :visible.sync="modalState.visible"
                                                             :scope.sync="state.selectedScope"
                                                             :selected-webhook.sync="state.selectedWebhook"
        />
    </div>
</template>
