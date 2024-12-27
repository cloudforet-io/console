<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ServiceChannelCreateParameters } from '@/schema/alert-manager/service-channel/api-verbs/create';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import NotificationsCreateForm from '@/services/alert-manager/components/NotificationsCreateForm.vue';
import NotificationsCreateTypeSelector
    from '@/services/alert-manager/components/NotificationsCreateTypeSelector.vue';
import ServiceCreateStepContainer from '@/services/alert-manager/components/ServiceCreateStepContainer.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager/stores/service-create-form-store';
import type { CreatedNotificationInfoType } from '@/services/alert-manager/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    currentSubStep: computed<number>(() => serviceCreateFormState.currentSubStep),
    selectedProtocol: computed<string>(() => serviceCreateFormState.selectedProtocol?.protocol_id || ''),
    createdServiceId: computed<string>(() => serviceCreateFormState.createdServiceId),
    webhookName: computed<string>(() => serviceCreateFormState.webhookName || ''),
});
const state = reactive({
    form: {} as CreatedNotificationInfoType,
    isAllFormValid: computed<boolean>(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedProtocol !== '';
        const { name, data } = state.form;

        if (!name) return false;
        if (data.FORWARD_TYPE === 'USER') {
            return Array.isArray(data.USER) && data.USER.length > 0 && !data.USER_GROUP;
        }
        if (data.FORWARD_TYPE === 'USER_GROUP') {
            return Array.isArray(data.USER_GROUP) && data.USER_GROUP.length > 0 && !data.USER;
        }
        if (data.FORWARD_TYPE === 'ALL_MEMBER') {
            return !data.USER && !data.USER_GROUP;
        }
        return false;
    }),
});

const routeDetailSettingPage = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: storeState.createdServiceId,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.SETTINGS,
        },
    }));
};
const handleChangeForm = (form: CreatedNotificationInfoType) => {
    state.form = form;
};

const fetchCreateNotifications = async () => {
    try {
        await SpaceConnector.clientV2.alertManager.serviceChannel.create<ServiceChannelCreateParameters, ServiceChannelModel>({
            protocol_id: storeState.selectedProtocol,
            service_id: storeState.createdServiceId,
            ...state.form,
        });
        await routeDetailSettingPage();
        showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_CREATED'), '');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

onUnmounted(() => {
    serviceCreateFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step3"
                                   :selected-item-id="storeState.selectedProtocol"
                                   :is-all-form-valid="state.isAllFormValid"
                                   @create="fetchCreateNotifications"
    >
        <notifications-create-type-selector v-if="storeState.currentSubStep === 1" />
        <notifications-create-form v-if="storeState.currentSubStep === 2"
                                   @change-form="handleChangeForm"
        />
    </service-create-step-container>
</template>
