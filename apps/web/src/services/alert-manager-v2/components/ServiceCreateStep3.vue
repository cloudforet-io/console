<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';

import ServiceCreateStep3SelectProtocol
    from '@/services/alert-manager-v2/components/ServiceCreateStep3SelectProtocol.vue';
import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/store/service-create-form-store';

const serviceFormStore = useServiceCreateFormStore();
const serviceFormState = serviceFormStore.state;

const storeState = reactive({
    currentSubStep: computed<number>(() => serviceFormState.currentSubStep),
    selectedProtocol: computed<any>(() => serviceFormState.selectedProtocol?.protocol_id || ''),
    webhookName: computed<string>(() => serviceFormState.webhookName || ''),
});
const state = reactive({
    isAllFormValid: computed(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedProtocol !== '';
        return true;
    }),
});

onUnmounted(() => {
    serviceFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step3"
                                   :selected-item-id="storeState.selectedProtocol"
                                   :is-all-form-valid="state.isAllFormValid"
    >
        <service-create-step3-select-protocol v-if="storeState.currentSubStep === 1" />
    </service-create-step-container>
</template>
