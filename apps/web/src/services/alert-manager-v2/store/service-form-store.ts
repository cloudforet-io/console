import { reactive } from 'vue';

import { defineStore } from 'pinia';

type ServiceMemberType = {
    USER?: string[],
    USER_GROUP?: string[],
};
interface ServiceFormState {
    name: string;
    key: string;
    member: ServiceMemberType;
    description: string;
}

interface ServiceFormStoreState extends ServiceFormState {
    currentStep: number;
}

export const useServiceFormStore = defineStore('service-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        name: '',
        key: '',
        member: {},
        description: '',
    });

    const actions = {
        init() {
            state.currentStep = 1;
            state.name = '';
            state.key = '';
            state.member = {};
            state.description = '';
        },
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setFormStep1(form: ServiceFormState) {
            state.name = form.name;
            state.key = form.key;
            state.member = form.member;
            state.description = form.description;
        },
    };

    return {
        state,
        ...actions,
    };
});
