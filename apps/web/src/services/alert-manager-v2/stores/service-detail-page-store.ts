import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { ServiceDeleteParameters } from '@/schema/alert-manager/service/api-verbs/delete';
import type { ServiceGetParameters } from '@/schema/alert-manager/service/api-verbs/get';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceUpdateParameters } from '@/schema/alert-manager/service/api-verbs/update';
import { NOTIFICATION_URGENCY, RECOVERY_MODE, SERVICE_ALERTS_TYPE } from '@/schema/alert-manager/service/constants';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { AlertsInfoType, AlertsType } from '@/schema/alert-manager/service/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/common-constant';
import type { ServiceDetailTabsType, Service } from '@/services/alert-manager-v2/types/alert-manager-type';

interface ServiceFormStoreState {
    loading: boolean;
    currentTab: ServiceDetailTabsType;
    serviceInfo: ServiceModel;
    serviceList: ServiceModel[];
    notificationProtocolList: NotificationProtocolModel[];
    selectedWebhookId?: string;
}
interface ServiceFormStoreGetters {
    serviceInfo: ComputedRef<Service>;
}

export const useServiceDetailPageStore = defineStore('page-service-detail', () => {
    const state = reactive<ServiceFormStoreState>({
        loading: false,
        currentTab: SERVICE_DETAIL_TABS.OVERVIEW,
        serviceInfo: {} as ServiceModel,
        serviceList: [],
        notificationProtocolList: [],
        selectedWebhookId: undefined,
    });

    const getters = reactive<ServiceFormStoreGetters>({
        serviceInfo: computed<Service>(() => {
            const defaultAlerts = { high: 0, low: 0 };
            const getAlerts = (alertKey: AlertsType): AlertsInfoType => {
                const alertValue = state.serviceInfo.alerts?.[alertKey] || defaultAlerts;
                return Object.keys(alertValue || {}).length ? alertValue : defaultAlerts;
            };
            return {
                ...state.serviceInfo,
                members: {
                    USER_GROUP: state.serviceInfo.members?.USER_GROUP || [],
                    USER: state.serviceInfo.members?.USER || [],
                },
                options: {
                    notification_urgency: state.serviceInfo.options?.notification_urgency || NOTIFICATION_URGENCY.ALL,
                    recovery_mode: state.serviceInfo.options?.recovery_mode || RECOVERY_MODE.MANUAL,
                },
                alerts: {
                    TRIGGERED: getAlerts(SERVICE_ALERTS_TYPE.TRIGGERED),
                    ACKNOWLEDGED: getAlerts(SERVICE_ALERTS_TYPE.ACKNOWLEDGED),
                    RESOLVED: getAlerts(SERVICE_ALERTS_TYPE.RESOLVED),
                    TOTAL: getAlerts(SERVICE_ALERTS_TYPE.TOTAL),
                },
            };
        }),
    });

    const mutations = {
        setCurrentTab(currentTab: ServiceDetailTabsType) {
            state.currentTab = currentTab;
        },
        setSelectedWebhookId(id?: string) {
            state.selectedWebhookId = id;
        },
    };

    const actions = {
        initState() {
            state.loading = false;
            state.currentTab = SERVICE_DETAIL_TABS.OVERVIEW;
            state.serviceInfo = {} as ServiceModel;
            state.serviceList = [];
            state.notificationProtocolList = [];
            state.selectedWebhookId = undefined;
        },
        async fetchServiceDetailData(id: string) {
            state.loading = true;
            try {
                state.serviceInfo = await SpaceConnector.clientV2.alertManager.service.get<ServiceGetParameters, ServiceModel>({
                    service_id: id,
                });
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.serviceInfo = {} as ServiceModel;
            } finally {
                state.loading = false;
            }
        },
        async updateServiceDetailData(name: string) {
            try {
                state.serviceInfo = await SpaceConnector.clientV2.alertManager.service.update<ServiceUpdateParameters, ServiceModel>({
                    service_id: getters.serviceInfo.service_id,
                    name,
                });
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.serviceInfo = {} as ServiceModel;
            }
        },
        async deleteServiceDetailData() {
            try {
                await SpaceConnector.clientV2.alertManager.service.delete<ServiceDeleteParameters>({
                    service_id: getters.serviceInfo.service_id,
                });
            } catch (e) {
                ErrorHandler.handleError(e, true);
            }
        },
        async fetchServiceList() {
            try {
                const { results } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>();
                state.serviceList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.serviceList = [];
            }
        },
        async fetchNotificationProtocolList() {
            try {
                const { results } = await SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>();
                state.notificationProtocolList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.notificationProtocolList = [];
            }
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
