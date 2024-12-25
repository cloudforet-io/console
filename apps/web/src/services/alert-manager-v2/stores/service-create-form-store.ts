import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { PluginModel } from '@/schema/repository/plugin/model';

interface ServiceFormStoreState {
    currentStep: number;
    currentSubStep: number;
    createdServiceId: string;
    selectedWebhookType?: PluginModel;
    webhookName: string;
    webhookVersion?: string;
    selectedProtocol?: NotificationProtocolModel;
}

export const useServiceCreateFormStore = defineStore('service-create-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        // service
        createdServiceId: '',
        // webhook
        selectedWebhookType: undefined,
        webhookName: '',
        webhookVersion: undefined,
        // notification
        selectedProtocol: undefined,
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

        setSelectedProtocol(protocol: NotificationProtocolModel) {
            state.selectedProtocol = protocol;
        },
    };
    const actions = {
        initState() {
            state.currentStep = 1;
            state.currentSubStep = 1;
            state.createdServiceId = '';
            state.selectedWebhookType = undefined;
            state.webhookName = '';
            state.webhookVersion = undefined;
            state.selectedProtocol = undefined;
        },
        initStep2() {
            state.currentSubStep = 1;
            state.selectedWebhookType = undefined;
            state.webhookName = '';
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
