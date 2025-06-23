<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';

import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';

import ServiceCreateStepContainer from '@/services/alert-manager/v2/components/ServiceCreateStepContainer.vue';
import WebhookCreateForm from '@/services/alert-manager/v2/components/WebhookCreateForm.vue';
import WebhookCreateSuccessMode
    from '@/services/alert-manager/v2/components/WebhookCreateSuccessMode.vue';
import WebhookCreateTypeSelector
    from '@/services/alert-manager/v2/components/WebhookCreateTypeSelector.vue';
import { useWebhookCreateMutation } from '@/services/alert-manager/v2/composables/use-webhook-create-mutation';
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
    isAllFormValid: computed<boolean>(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedWebhookType?.plugin_id !== '';
        if (storeState.currentSubStep === 2) return storeState.webhookName !== '';
        return true;
    }),
    succeedWebhook: undefined as undefined|WebhookModel,
});

const { mutateAsync: createWebhook, isPending: createWebhookLoading } = useWebhookCreateMutation({
    onSuccess: (data) => {
        state.succeedWebhook = data as WebhookModel;
        serviceCreateFormStore.setCurrentSubStep(3);
    },
    onError: () => {
        state.succeedWebhook = undefined;
    },
});

const handleCreateWebhook = async () => {
    createWebhook({
        name: storeState.webhookName,
        plugin_info: {
            plugin_id: storeState.selectedWebhookType?.plugin_id || '',
            version: storeState.webhookVersion,
        },
        service_id: storeState.createdServiceId,
    });
};

onUnmounted(() => {
    serviceCreateFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step2"
                                   :selected-item-id="storeState.selectedWebhookType?.plugin_id || ''"
                                   :is-all-form-valid="state.isAllFormValid"
                                   :loading="createWebhookLoading"
                                   @create="handleCreateWebhook"
    >
        <webhook-create-type-selector v-if="storeState.currentSubStep === 1" />
        <webhook-create-form v-else-if="storeState.currentSubStep === 2" />
        <webhook-create-success-mode v-else-if="storeState.currentSubStep === 3"
                                     :succeed-webhook="state.succeedWebhook"
        />
    </service-create-step-container>
</template>
