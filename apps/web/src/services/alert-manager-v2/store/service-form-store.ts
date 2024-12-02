import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { PluginModel } from '@/schema/repository/plugin/model';

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

interface ServiceFormStoreState {
    step1Form: ServiceStep1FormState;
    currentStep: number;
    currentSubStep: number;
    selectedWebhookType: PluginModel;
    webhookName: string;
    // TODO: add type
    selectedProtocol: any;
}

export const useServiceFormStore = defineStore('service-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        // service
        step1Form: {
            name: '',
            key: '',
            member: {},
            description: '',
        },
        // webhook
        selectedWebhookType: {} as PluginModel,
        webhookName: '',
        // notification
        selectedProtocol: {},
    });

    const actions = {
        initState() {
            state.currentStep = 1;
            state.currentSubStep = 1;
        },
        initStep1() {
            state.step1Form = {
                name: '',
                key: '',
                member: {},
                description: '',
            };
        },
        initStep2() {
            state.currentSubStep = 1;
            state.selectedWebhookType = {} as PluginModel;
            state.webhookName = '';
        },
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setCurrentSubStep(step: number) {
            state.currentSubStep = step;
        },
        setFormStep1(form: ServiceStep1FormState) {
            state.step1Form = form;
        },
        setSelectedWebhookType(webhookType: PluginModel) {
            state.selectedWebhookType = webhookType;
        },
        setWebhookName(name: string) {
            state.webhookName = name;
        },
        // TODO: add type
        setSelectedProtocol(protocol: any) {
            state.selectedProtocol = protocol;
        },
    };

    return {
        state,
        ...actions,
    };
});
