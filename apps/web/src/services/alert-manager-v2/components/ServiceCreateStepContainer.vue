<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/store/service-create-form-store';

type actionButtonType = {
    label: TranslateResult,
    hasIcon?: boolean,
};

interface Props {
    isAllFormValid: boolean;
    selectedWebhookTypeId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    isAllFormValid: false,
    selectedWebhookTypeId: undefined,
});

const emit = defineEmits<{(e: 'create'): void}>();

const serviceFormStore = useServiceCreateFormStore();
const serviceFormState = serviceFormStore.state;

const router = useRouter();

const storeState = reactive({
    currentStep: computed<number>(() => serviceFormState.currentStep),
    currentSubStep: computed<number>(() => serviceFormState.currentSubStep),
});
const state = reactive({
    previousStep: computed<number>(() => serviceFormState.currentStep - 1),
    nextStep: computed<number>(() => serviceFormState.currentStep + 1),
    previousSubStep: computed<number>(() => serviceFormState.currentSubStep - 1),
    nextSubStep: computed<number>(() => serviceFormState.currentSubStep + 1),
    actionButtonInfoMap: computed<Record<string, actionButtonType>>(() => ({
        1: {
            label: i18n.t('ALERT_MANAGER.CONTINUE'),
            hasIcon: true,
        },
        '2-1': {
            label: i18n.t('ALERT_MANAGER.SERVICE.SELECT'),
        },
        '2-2': {
            label: i18n.t('ALERT_MANAGER.CREATE'),
        },
        '2-3': {
            label: i18n.t('ALERT_MANAGER.CONTINUE'),
            hasIcon: true,
        },
        '3-1': {
            label: i18n.t('ALERT_MANAGER.SERVICE.SELECT'),
        },
        '3-2': {
            label: i18n.t('ALERT_MANAGER.SET_UP'),
        },
    })),
    actionButtonInfo: computed<actionButtonType>(() => {
        const key = storeState.currentStep === 1
            ? '1'
            : `${storeState.currentStep}-${storeState.currentSubStep}`;

        return state.actionButtonInfoMap[key] || ({} as actionButtonType);
    }),
});

const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
        handlePrevNavigation();
    } else {
        handleNextNavigation();
    }
};
const handlePrevNavigation = () => {
    if (storeState.currentStep === 1) {
        router.push({ name: ALERT_MANAGER_V2_ROUTE.SERVICE._NAME });
        return;
    }
    if (storeState.currentStep === 2) {
        if (props.selectedWebhookTypeId) {
            if (storeState.currentSubStep === 3) {
                router.push({ name: ALERT_MANAGER_V2_ROUTE.SERVICE._NAME });
                return;
            }
            serviceFormStore.setCurrentSubStep(state.previousSubStep);
            return;
        }
    }
    serviceFormStore.setCurrentStep(state.previousStep);
};
const handleNextNavigation = () => {
    serviceFormStore.setCurrentStep(state.nextStep);
};

const handleActionButton = () => {
    if (state.actionButtonInfo.hasIcon) {
        handleNavigation('next');
    } else if (storeState.currentSubStep === 1) {
        handleClickSelectButton();
    } else {
        emit('create');
    }
};

const handleClickSelectButton = () => {
    if (storeState.currentStep === 2 && props.selectedWebhookTypeId) {
        serviceFormStore.setCurrentSubStep(state.nextSubStep);
    }
};
const handleClickSkipButton = () => {
    console.log('TODO: handleClickSkipButton');
};
</script>

<template>
    <div class="service-create-step-container">
        <slot />
        <div class="buttons-wrapper">
            <div class="previous-button">
                <p-button v-if="storeState.currentStep === 1 || storeState.currentSubStep === 3"
                          style-type="transparent"
                          size="lg"
                          @click="handleNavigation('prev')"
                >
                    {{ $t('ALERT_MANAGER.CANCEL') }}
                </p-button>
                <p-button v-else
                          style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="handleNavigation('prev')"
                >
                    {{ $t('ALERT_MANAGER.SERVICE.GO_BACK') }}
                </p-button>
            </div>
            <p-button v-if="storeState.currentStep !== 1 && storeState.currentSubStep === 1"
                      style-type="tertiary"
                      class="skip-button"
                      size="lg"
                      @click="handleClickSkipButton"
            >
                {{ $t('ALERT_MANAGER.SERVICE.SKIP_FOR_LATER') }}
            </p-button>
            <p-button :disabled="!props.isAllFormValid"
                      class="step-right-button"
                      style-type="substitutive"
                      :icon-right="state.actionButtonInfo.hasIcon ? 'ic_arrow-right' : undefined"
                      size="lg"
                      @click="handleActionButton"
            >
                {{ state.actionButtonInfo.label }}
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
