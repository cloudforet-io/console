import { reactive } from 'vue';

import { defineStore } from 'pinia';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { PluginModel } from '@/schema/repository/plugin/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface ServiceFormStoreState {
    currentStep: number;
    currentSubStep: number;
    createdService: ServiceModel;
    selectedWebhookType: PluginModel;
    webhookName: string;
    webhookVersion?: string;
    selectedProtocol: ProtocolCardItemType;
    protocolList: NotificationProtocolModel[];
}

export const useServiceCreateFormStore = defineStore('service-create-form', () => {
    const state = reactive<ServiceFormStoreState>({
        currentStep: 1,
        currentSubStep: 1,
        // service
        createdService: {} as ServiceModel,
        // webhook
        selectedWebhookType: {} as PluginModel,
        webhookName: '',
        webhookVersion: undefined,
        // notification
        selectedProtocol: {} as ProtocolCardItemType,
        protocolList: [],
    });

    const mutations = {
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setCurrentSubStep(step: number) {
            state.currentSubStep = step;
        },

        setCreatedService(service: ServiceModel) {
            state.createdService = service;
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
            state.createdService = {} as ServiceModel;
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
        async fetchNotificationProtocolList() {
            try {
                const { results } = await SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>();
                state.protocolList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.protocolList = [];
                throw e;
            }
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
