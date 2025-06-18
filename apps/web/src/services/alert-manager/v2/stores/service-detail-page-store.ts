import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ServiceGetParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/get';
import type { ServiceUpdateParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/update';
import { NOTIFICATION_URGENCY, RECOVERY_MODE, SERVICE_ALERTS_TYPE } from '@/api-clients/alert-manager/service/schema/constants';
import type { ServiceModel } from '@/api-clients/alert-manager/service/schema/model';
import type { AlertsInfoType, AlertsType } from '@/api-clients/alert-manager/service/schema/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    ServiceDetailTabsType,
    Service,
} from '@/services/alert-manager/v2/types/alert-manager-type';

interface ServiceFormStoreState {
    loading: boolean;
    currentTab?: ServiceDetailTabsType;
    serviceInfo: ServiceModel;
    selectedWebhookId?: string;
    selectedNotificationId?: string;
    selectedEscalationPolicyId?: string;
    eventRuleScopeModalVisible: boolean;
    showEventRuleFormCard: boolean;
    isEventRuleEditMode: boolean;
}
interface ServiceFormStoreGetters {
    serviceInfo: ComputedRef<Service>;
    pluginsReferenceMap: ComputedRef<PluginReferenceMap>;
    userGroupReferenceMap: ComputedRef<UserGroupReferenceMap>;
    userReferenceMap: ComputedRef<UserReferenceMap>;
    serviceReferenceMap: ComputedRef<ServiceReferenceMap>;
    timezone: ComputedRef<string>;
    language: ComputedRef<string>;
}

export const useServiceDetailPageStore = defineStore('page-service-detail', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;
    const userStore = useUserStore();
    const userState = userStore.state;

    const state = reactive<ServiceFormStoreState>({
        loading: false,
        currentTab: undefined,
        serviceInfo: {} as ServiceModel,
        selectedWebhookId: undefined,
        selectedNotificationId: undefined,
        selectedEscalationPolicyId: undefined,
        eventRuleScopeModalVisible: false,
        showEventRuleFormCard: false,
        isEventRuleEditMode: false,
    });

    const getters = reactive<ServiceFormStoreGetters>({
        serviceInfo: computed(() => {
            const getAlerts = (alertKey: AlertsType): AlertsInfoType => {
                const alertValue = state.serviceInfo.alerts?.[alertKey] || { HIGH: 0, LOW: 0 };
                return {
                    HIGH: alertValue.HIGH || 0,
                    LOW: alertValue.LOW || 0,
                };
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
        pluginsReferenceMap: computed(() => allReferenceGetters.plugin),
        userGroupReferenceMap: computed(() => allReferenceGetters.user_group),
        userReferenceMap: computed(() => allReferenceGetters.user),
        serviceReferenceMap: computed(() => allReferenceGetters.service),
        timezone: computed(() => userState.timezone || 'UTC'),
        language: computed(() => userStore.state.language || 'en'),
    });

    const mutations = {
        setCurrentTab(currentTab?: ServiceDetailTabsType) {
            state.currentTab = currentTab;
        },
        setSelectedWebhookId(id?: string) {
            state.selectedWebhookId = id;
        },
        setSelectedNotificationId(id?: string) {
            state.selectedNotificationId = id;
        },
        setSelectedEscalationPolicyId(id?: string) {
            state.selectedEscalationPolicyId = id;
        },
        setEventRuleScopeModalVisible(visible: boolean) {
            state.eventRuleScopeModalVisible = visible;
        },
        setShowEventRuleFormCard(visible: boolean) {
            state.showEventRuleFormCard = visible;
        },
        setIsEventRuleEditMode(editMode: boolean) {
            state.isEventRuleEditMode = editMode;
        },
    };

    const actions = {
        initState() {
            state.loading = false;
            state.currentTab = undefined;
            state.serviceInfo = {} as ServiceModel;
            state.selectedWebhookId = undefined;
            state.selectedNotificationId = undefined;
            state.selectedEscalationPolicyId = undefined;
            state.eventRuleScopeModalVisible = false;
            state.showEventRuleFormCard = false;
            state.isEventRuleEditMode = false;
        },
        initEscalationPolicyState() {
            state.eventRuleScopeModalVisible = false;
            state.showEventRuleFormCard = false;
            state.isEventRuleEditMode = false;
        },
        async fetchServiceDetailData(id: string) {
            state.loading = true;
            try {
                state.serviceInfo = await SpaceConnector.clientV2.alertManager.service.get<ServiceGetParameters, ServiceModel>({
                    service_id: id,
                    details: true,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                state.serviceInfo = {} as ServiceModel;
                throw e;
            } finally {
                state.loading = false;
            }
        },
        async updateServiceDetailData({ name, description }: { name: string, description: string }) {
            try {
                await SpaceConnector.clientV2.alertManager.service.update<ServiceUpdateParameters, ServiceModel>({
                    service_id: getters.serviceInfo.service_id,
                    name,
                    description,
                });
                showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_UPDATE_SERVICE'), '');
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.serviceInfo = {} as ServiceModel;
                throw e;
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
