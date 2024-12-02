<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';

import ServiceCreateStep2SelectWebhookType
    from '@/services/alert-manager-v2/components/ServiceCreateStep2SelectWebhookType.vue';
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
    versionLoading: false,
    isAllFormValid: computed(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedWebhookTypeId !== '';
        if (storeState.currentSubStep === 2) return storeState.webhookName !== '';
        return true;
    }),
});

onUnmounted(() => {
    serviceFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step2"
                                   :is-all-form-valid="state.isAllFormValid"
    >
        <service-create-step2-select-webhook-type v-if="storeState.currentSubStep === 1" />
    </service-create-step-container>
</template>
