import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { PluginModel } from '@/schema/repository/plugin/model';

interface ServiceFormStoreState {
    currentStep: number;
    currentSubStep: number;
    createdServiceId: string;
    selectedWebhookType: PluginModel;
    webhookName: string;
    // TODO: add type
    selectedProtocol: any;
}

export const useServiceCreateFormStore = defineStore('service-create-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        createdServiceId: '',
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
            state.createdServiceId = '';
            state.selectedWebhookType = {} as PluginModel;
            state.webhookName = '';
            state.selectedProtocol = {};
        },
        initStep2() {
            state.currentSubStep = 1;
            state.selectedWebhookType = {} as PluginModel;
            state.webhookName = '';
        },
        setCreatedServiceId(id: string) {
            state.createdServiceId = id;
        },
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setCurrentSubStep(step: number) {
            state.currentSubStep = step;
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
