<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton } from '@cloudforet/mirinae';

import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceFormStore } from '@/services/alert-manager-v2/store/service-form-store';


interface Props {
    isAllFormValid: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isAllFormValid: false,
});

const serviceFormStore = useServiceFormStore();
const serviceFormState = serviceFormStore.state;

const router = useRouter();

const storeState = reactive({
    currentStep: computed<number>(() => serviceFormState.currentStep),
});
const state = reactive({
    previousStep: computed<number>(() => serviceFormState.currentStep - 1),
    nextStep: computed<number>(() => serviceFormState.currentStep + 1),
});

const handleClickPrevButton = () => {
    if (storeState.currentStep === 1) {
        router.push({ name: ALERT_MANAGER_V2_ROUTE.SERVICE._NAME });
    }
};
const handleClickNextButton = () => {
    serviceFormStore.setCurrentStep(state.nextStep);
};
</script>

<template>
    <div class="service-create-step-container">
        <slot />
        <div class="buttons-wrapper">
            <p-button v-if="storeState.currentStep === 1"
                      style-type="transparent"
                      class="step-left-base-button"
                      size="lg"
                      @click="handleClickPrevButton"
            >
                {{ $t('ALERT_MANAGER.CANCEL') }}
            </p-button>
            <p-button v-if="storeState.currentStep !== 3"
                      :disabled="!props.isAllFormValid"
                      class="step-right-button"
                      style-type="substitutive"
                      icon-right="ic_arrow-right"
                      size="lg"
                      @click="handleClickNextButton"
            >
                {{ $t('ALERT_MANAGER.CONTINUE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-create-step-container {
    .buttons-wrapper {
        @apply flex justify-end;
        padding-top: 2rem;
        gap: 1rem;
    }
}
</style>
