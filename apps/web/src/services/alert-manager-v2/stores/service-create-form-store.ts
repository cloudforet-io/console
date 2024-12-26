import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { PluginModel } from '@/schema/repository/plugin/model';

import type { ProtocolCardItemType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface ServiceFormStoreState {
    currentStep: number;
    currentSubStep: number;
    createdServiceId: string;
    selectedWebhookType: PluginModel;
    webhookName: string;
    webhookVersion?: string;
    selectedProtocol: ProtocolCardItemType;
}

export const useServiceCreateFormStore = defineStore('service-create-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        // service
        createdServiceId: '',
        // webhook
        selectedWebhookType: {} as PluginModel,
        webhookName: '',
        webhookVersion: undefined,
        // notification
        selectedProtocol: {} as ProtocolCardItemType,
    });

    const mutations = {
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setCurrentSubStep(step: number) {
            state.currentSubStep = step;
        },

        setCreatedServiceId(id: string) {
            state.createdServiceId = id;
        },

        setSelectedWebhookType(webhookType: PluginModel) {
            state.selectedWebhookType = webhookType;
        },
        setWebhookName(name: string) {
            state.webhookName = name;
        },
        setWebhookVersion(version?: string) {
            state.webhookVersion = version;
        },

        setSelectedProtocol(protocol: ProtocolCardItemType) {
            state.selectedProtocol = protocol;
        },
    };
    const actions = {
        initState() {
            state.currentStep = 1;
            state.currentSubStep = 1;
            state.createdServiceId = '';
            state.selectedWebhookType = {} as PluginModel;
            state.webhookName = '';
            state.webhookVersion = undefined;
            state.selectedProtocol = {} as ProtocolCardItemType;
        },
        initStep2() {
            state.currentSubStep = 1;
            state.selectedWebhookType = {} as PluginModel;
            state.webhookName = '';
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
