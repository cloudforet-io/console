import { reactive } from 'vue';

import { defineStore } from 'pinia';

type ServiceMemberType = {
    USER?: string[],
    USER_GROUP?: string[],
};
interface ServiceStep1FormState {
    name: string;
    key: string;
    member: ServiceMemberType;
    description: string;
}

interface ServiceFormStoreState extends ServiceStep1FormState {
    currentStep: number;
    currentSubStep: number;
    selectedWebhookTypeId?: string;
}

export const useServiceFormStore = defineStore('service-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        name: '',
        key: '',
        member: {},
        description: '',
        selectedWebhookTypeId: undefined,
    });

    const actions = {
        init() {
            state.currentStep = 1;
            state.name = '';
            state.key = '';
            state.member = {};
            state.description = '';
            state.selectedWebhookTypeId = undefined;
        },
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setCurrentSubStep(step: number) {
            state.currentSubStep = step;
        },
        setFormStep1(form: ServiceStep1FormState) {
            state.name = form.name;
            state.key = form.key;
            state.member = form.member;
            state.description = form.description;
        },
        setSelectedWebhookTypeId(webhookTypeId: string) {
            state.selectedWebhookTypeId = webhookTypeId;
        },
    };

    return {
        state,
        ...actions,
    };
});
