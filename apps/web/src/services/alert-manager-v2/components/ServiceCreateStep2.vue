<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';

import ServiceCreateStep2CreatedWebhook
    from '@/services/alert-manager-v2/components/ServiceCreateStep2CreatedWebhook.vue';
import ServiceCreateStep2SelectWebhookType
    from '@/services/alert-manager-v2/components/ServiceCreateStep2SelectWebhookType.vue';
import ServiceCreateStep2WebhookForm from '@/services/alert-manager-v2/components/ServiceCreateStep2WebhookForm.vue';
import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import { useServiceFormStore } from '@/services/alert-manager-v2/store/service-form-store';

const serviceFormStore = useServiceFormStore();
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
        <service-create-step2-select-webhook-type v-if="storeState.currentSubStep === 1" />
        <service-create-step2-webhook-form v-else-if="storeState.currentSubStep === 2" />
        <service-create-step2-created-webhook v-else-if="storeState.currentSubStep === 3" />
    </service-create-step-container>
</template>
