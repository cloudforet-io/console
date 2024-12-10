<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';

type actionButtonType = {
    label: TranslateResult;
    type: 'create' | 'select' | 'continue' | 'set_up';
};

interface Props {
    isAllFormValid: boolean;
    selectedItemId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    isAllFormValid: false,
    selectedItemId: undefined,
});

const emit = defineEmits<{(e: 'create'): void}>();

const serviceFormStore = useServiceCreateFormStore();
const serviceFormState = serviceFormStore.state;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    currentStep: computed<number>(() => serviceFormState.currentStep),
    currentSubStep: computed<number>(() => serviceFormState.currentSubStep),
    createdServiceId: computed<string>(() => serviceFormState.createdServiceId),
});
const state = reactive({
    previousStep: computed<number>(() => serviceFormState.currentStep - 1),
    nextStep: computed<number>(() => serviceFormState.currentStep + 1),
    previousSubStep: computed<number>(() => serviceFormState.currentSubStep - 1),
    nextSubStep: computed<number>(() => serviceFormState.currentSubStep + 1),
    actionButtonInfoMap: computed<Record<string, actionButtonType>>(() => ({
        1: {
            label: i18n.t('ALERT_MANAGER.CREATE'),
            type: 'create',
        },
        '2-1': {
            label: i18n.t('ALERT_MANAGER.SERVICE.SELECT'),
            type: 'select',
        },
        '2-2': {
            label: i18n.t('ALERT_MANAGER.CREATE'),
            type: 'create',
        },
        '2-3': {
            label: i18n.t('ALERT_MANAGER.CONTINUE'),
            type: 'continue',
        },
        '3-1': {
            label: i18n.t('ALERT_MANAGER.SERVICE.SELECT'),
            type: 'select',
        },
        '3-2': {
            label: i18n.t('ALERT_MANAGER.SET_UP'),
            type: 'set_up',
        },
    })),
    actionButtonInfo: computed<actionButtonType>(() => {
        const key = storeState.currentStep === 1
            ? '1'
            : `${storeState.currentStep}-${storeState.currentSubStep}`;

        return state.actionButtonInfoMap[key] || ({} as actionButtonType);
    }),
});

const handleCancel = () => {
    router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE_V2.SERVICE._NAME }));
};
const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
        handlePrevNavigation();
    } else {
        handleNextNavigation();
    }
};
const handlePrevNavigation = () => {
    if (storeState.currentStep === 1) {
        router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE_V2.SERVICE._NAME }));
        return;
    }
    if (storeState.currentStep === 2) {
        if (props.selectedItemId) {
            if (storeState.currentSubStep === 3) {
                router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE_V2.SERVICE._NAME }));
                return;
            }
            serviceFormStore.setCurrentSubStep(state.previousSubStep);
            return;
        }
    }
    if (storeState.currentStep === 3) {
        if (storeState.currentSubStep === 2) {
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
    if (state.actionButtonInfo.type === 'continue') {
        handleNavigation('next');
    } else if (state.actionButtonInfo.type === 'select') {
        handleClickSelectButton();
    } else {
        emit('create');
    }
};

const handleClickSelectButton = () => {
    if (props.selectedItemId) {
        serviceFormStore.setCurrentSubStep(state.nextSubStep);
    }
};
const handleClickSkipButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
        params: {
            serviceId: storeState.createdServiceId,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.SETTINGS,
        },
    }));
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
                          @click="handleCancel"
                >
                    {{ $t('ALERT_MANAGER.CANCEL') }}
                </p-button>
                <p-button v-else-if="storeState.currentSubStep === 2"
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
                      :style-type="state.actionButtonInfo?.type === 'set_up' ? 'primary' : 'substitutive'"
                      :icon-right="state.actionButtonInfo?.type === 'continue' ? 'ic_arrow-right' : undefined"
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
