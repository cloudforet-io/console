<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';

import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import WebhookCreateForm from '@/services/alert-manager-v2/components/WebhookCreateForm.vue';
import WebhookCreateSuccessMode
    from '@/services/alert-manager-v2/components/WebhookCreateSuccessMode.vue';
import WebhookCreateTypeSelector
    from '@/services/alert-manager-v2/components/WebhookCreateTypeSelector.vue';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';

const serviceFormStore = useServiceCreateFormStore();
const serviceFormState = serviceFormStore.state;

const storeState = reactive({
    currentSubStep: computed<number>(() => serviceFormState.currentSubStep),
    selectedWebhookTypeId: computed<string>(() => serviceFormState.selectedWebhookType?.plugin_id || ''),
    webhookName: computed<string>(() => serviceFormState.webhookName || ''),
});
const state = reactive({
    isAllFormValid: computed(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedWebhookTypeId !== '';
        if (storeState.currentSubStep === 2) return storeState.webhookName !== '';
        return true;
    }),
});

const handleCreateWebhook = async () => {
    console.log('TODO: handleCreateWebhook');
    serviceFormStore.setCurrentSubStep(3);
};

onUnmounted(() => {
    serviceFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step2"
                                   :selected-item-id="storeState.selectedWebhookTypeId"
                                   :is-all-form-valid="state.isAllFormValid"
                                   @create="handleCreateWebhook"
    >
        <webhook-create-type-selector v-if="storeState.currentSubStep === 1" />
        <webhook-create-form v-else-if="storeState.currentSubStep === 2" />
        <webhook-create-success-mode v-else-if="storeState.currentSubStep === 3" />
    </service-create-step-container>
</template>
