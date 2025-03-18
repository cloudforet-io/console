<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WebhookCreateParameters } from '@/schema/alert-manager/webhook/api-verbs/create';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import type { PluginModel } from '@/schema/repository/plugin/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceCreateStepContainer from '@/services/alert-manager/v2/components/ServiceCreateStepContainer.vue';
import WebhookCreateForm from '@/services/alert-manager/v2/components/WebhookCreateForm.vue';
import WebhookCreateSuccessMode
    from '@/services/alert-manager/v2/components/WebhookCreateSuccessMode.vue';
import WebhookCreateTypeSelector
    from '@/services/alert-manager/v2/components/WebhookCreateTypeSelector.vue';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const storeState = reactive({
    currentSubStep: computed<number>(() => serviceCreateFormState.currentSubStep),
    selectedWebhookType: computed<PluginModel|undefined>(() => serviceCreateFormState.selectedWebhookType),
    webhookName: computed<string>(() => serviceCreateFormState.webhookName || ''),
    createdServiceId: computed<string>(() => serviceCreateFormState.createdService.service_id),
    webhookVersion: computed<string|undefined>(() => serviceCreateFormState.webhookVersion || ''),
});
const state = reactive({
    loading: false,
    isAllFormValid: computed<boolean>(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedWebhookType?.plugin_id !== '';
        if (storeState.currentSubStep === 2) return storeState.webhookName !== '';
        return true;
    }),
    succeedWebhook: undefined as undefined|WebhookModel,
});

const handleCreateWebhook = async () => {
    state.loading = true;
    try {
        state.succeedWebhook = await SpaceConnector.clientV2.alertManager.webhook.create<WebhookCreateParameters, WebhookModel>({
            name: storeState.webhookName,
            plugin_info: {
                plugin_id: storeState.selectedWebhookType?.plugin_id || '',
                version: storeState.webhookVersion,
            },
            service_id: storeState.createdServiceId,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.WEBHOOK.ALT_S_CREATE_WEBHOOK'), '');
        serviceCreateFormStore.setCurrentSubStep(3);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};

onUnmounted(() => {
    serviceCreateFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step2"
                                   :selected-item-id="storeState.selectedWebhookType?.plugin_id || ''"
                                   :is-all-form-valid="state.isAllFormValid"
                                   :loading="state.loading"
                                   @create="handleCreateWebhook"
    >
        <webhook-create-type-selector v-if="storeState.currentSubStep === 1" />
        <webhook-create-form v-else-if="storeState.currentSubStep === 2" />
        <webhook-create-success-mode v-else-if="storeState.currentSubStep === 3"
                                     :succeed-webhook="state.succeedWebhook"
        />
    </service-create-step-container>
</template>
