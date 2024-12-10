import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import type { PluginModel } from '@/schema/repository/plugin/model';

interface ServiceFormStoreState {
    currentStep: number;
    currentSubStep: number;
    createdServiceId: string;
    selectedWebhookType?: PluginModel;
    webhookName: string;
    createdWebhookInfo?: WebhookModel;
    // TODO: add type
    selectedProtocol: any;
}

export const useServiceCreateFormStore = defineStore('service-create-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        createdServiceId: '',
        // webhook
        selectedWebhookType: undefined,
        webhookName: '',
        createdWebhookInfo: undefined,
        // notification
        selectedProtocol: {},
    });

    const actions = {
        initState() {
            state.currentStep = 1;
            state.currentSubStep = 1;
            state.createdServiceId = '';
            state.selectedWebhookType = undefined;
            state.webhookName = '';
            state.createdWebhookInfo = undefined;
            state.selectedProtocol = {};
        },
        initStep2() {
            state.currentSubStep = 1;
            state.selectedWebhookType = undefined;
            state.webhookName = '';
        },

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
        setCreatedWebhookInfo(webhook: WebhookModel) {
            state.createdWebhookInfo = webhook;
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
