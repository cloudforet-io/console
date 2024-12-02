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

interface ServiceFormStoreState extends ServiceStep1FormState {
    currentStep: number;
    currentSubStep: number;
    selectedWebhookType: PluginModel;
    webhookName: string;
}

export const useServiceFormStore = defineStore('service-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        // service
        name: '',
        key: '',
        member: {},
        description: '',
        // webhook
        selectedWebhookType: {} as PluginModel,
        webhookName: '',
    });

    const actions = {
        initState() {
            state.currentStep = 1;
            state.currentSubStep = 1;
        },
        initStep1() {
            state.name = '';
            state.key = '';
            state.member = {};
            state.description = '';
        },
        initStep2() {
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
            state.name = form.name;
            state.key = form.key;
            state.member = form.member;
            state.description = form.description;
        },
        setSelectedWebhookType(webhookType: PluginModel) {
            state.selectedWebhookType = webhookType;
        },
        setWebhookName(name: string) {
            state.webhookName = name;
        },
    };

    return {
        state,
        ...actions,
    };
});
