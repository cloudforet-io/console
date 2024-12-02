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
    currentSubStep: computed<number>(() => serviceFormState.currentSubStep),
    selectedWebhookTypeId: computed<string|undefined>(() => serviceFormState.selectedWebhookTypeId),
});
const state = reactive({
    previousStep: computed<number>(() => serviceFormState.currentStep - 1),
    nextStep: computed<number>(() => serviceFormState.currentStep + 1),
    previousSubStep: computed<number>(() => serviceFormState.currentSubStep - 1),
    nextSubStep: computed<number>(() => serviceFormState.currentSubStep + 1),
});

const handleClickPrevButton = () => {
    if (storeState.currentStep === 1) return router.push({ name: ALERT_MANAGER_V2_ROUTE.SERVICE._NAME });
    if (storeState.currentStep === 2) {
        if (storeState.selectedWebhookTypeId) return serviceFormStore.setCurrentSubStep(state.previousSubStep);
    }
    return serviceFormStore.setCurrentStep(state.previousStep);
};
const handleClickNextButton = () => {
    if (storeState.currentStep === 2) {
        if (storeState.selectedWebhookTypeId) return serviceFormStore.setCurrentSubStep(state.nextSubStep);
    }
    return serviceFormStore.setCurrentStep(state.nextStep);
};
const handleClickSkipButton = () => {
    console.log('TODO: handleClickSkipButton');
};
</script>

<template>
    <div class="service-create-step-container">
        <slot />
        <div class="buttons-wrapper">
            <div>
                <p-button v-if="storeState.currentStep === 1"
                          style-type="transparent"
                          class="step-left-base-button"
                          size="lg"
                          @click="handleClickPrevButton"
                >
                    {{ $t('ALERT_MANAGER.CANCEL') }}
                </p-button>
                <p-button v-else
                          style-type="transparent"
                          class="step-left-base-button"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="handleClickPrevButton"
                >
                    {{ $t('ALERT_MANAGER.SERVICE.GO_BACK') }}
                </p-button>
            </div>
            <p-button v-if="storeState.currentStep !== 1 && storeState.currentSubStep === 1"
                      style-type="tertiary"
                      class="step-left-base-button"
                      size="lg"
                      @click="handleClickSkipButton"
            >
                {{ $t('ALERT_MANAGER.SERVICE.SKIP_FOR_LATER') }}
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
