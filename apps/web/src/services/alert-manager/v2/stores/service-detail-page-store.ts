import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import type {
    ServiceDetailTabsType,
} from '@/services/alert-manager/v2/types/alert-manager-type';

interface ServiceFormStoreState {
    currentTab?: ServiceDetailTabsType;
    selectedWebhookId?: string;
    selectedNotificationId?: string;
    selectedEscalationPolicyId?: string;
    eventRuleScopeModalVisible: boolean;
    showEventRuleFormCard: boolean;
    isEventRuleEditMode: boolean;
}
interface ServiceFormStoreGetters {
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
        currentTab: undefined,
        selectedWebhookId: undefined,
        selectedNotificationId: undefined,
        selectedEscalationPolicyId: undefined,
        eventRuleScopeModalVisible: false,
        showEventRuleFormCard: false,
        isEventRuleEditMode: false,
    });

    const getters = reactive<ServiceFormStoreGetters>({
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
            state.currentTab = undefined;
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
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
