<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import NotificationsCreateForm from '@/services/alert-manager/v2/components/NotificationsCreateForm.vue';
import NotificationsCreateTypeSelector
    from '@/services/alert-manager/v2/components/NotificationsCreateTypeSelector.vue';
import ServiceCreateStepContainer from '@/services/alert-manager/v2/components/ServiceCreateStepContainer.vue';
import { useServiceChannelCreateMutation } from '@/services/alert-manager/v2/composables/use-service-channel-create-mutation';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import type { CreatedNotificationInfoType } from '@/services/alert-manager/v2/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const router = useRouter();

const storeState = reactive({
    currentSubStep: computed<number>(() => serviceCreateFormState.currentSubStep),
    selectedProtocol: computed<string>(() => serviceCreateFormState.selectedProtocol?.protocol_id || ''),
    createdServiceId: computed<string>(() => serviceCreateFormState.createdService.service_id),
    webhookName: computed<string>(() => serviceCreateFormState.webhookName || ''),
});
const state = reactive({
    form: {} as CreatedNotificationInfoType,
    formValid: false,
    isAllFormValid: computed<boolean>(() => {
        if (storeState.currentSubStep === 1) return storeState.selectedProtocol !== '';
        return state.formValid;
    }),
    isForwardTypeProtocol: computed<boolean>(() => storeState.selectedProtocol?.toLowerCase().includes('forward') || false),
});

const { mutate: serviceChannelCreateMutate, isPending: createChannelLoading } = useServiceChannelCreateMutation({
    onSuccess: async () => {
        await routeDetailSettingPage();
    },
    isForwardTypeProtocol: computed(() => state.isForwardTypeProtocol),
});

const routeDetailSettingPage = () => {
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: storeState.createdServiceId,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.SETTINGS,
        },
    }).catch(() => {});
};
const handleChangeForm = (form: CreatedNotificationInfoType, formValid: boolean) => {
    state.form = form;
    state.formValid = formValid;
};

const fetchCreateNotifications = () => {
    const defaultParams = {
        service_id: storeState.createdServiceId,
        ...state.form,
    };
    if (!state.isForwardTypeProtocol) {
        defaultParams.protocol_id = storeState.selectedProtocol;
    }
    serviceChannelCreateMutate(defaultParams);
};

onUnmounted(() => {
    serviceCreateFormStore.initStep2();
});
</script>

<template>
    <service-create-step-container class="service-create-step3"
                                   :selected-item-id="storeState.selectedProtocol"
                                   :is-all-form-valid="state.isAllFormValid"
                                   :loading="createChannelLoading"
                                   @create="fetchCreateNotifications"
    >
        <notifications-create-type-selector v-if="storeState.currentSubStep === 1" />
        <notifications-create-form v-if="storeState.currentSubStep === 2"
                                   @change-form="handleChangeForm"
        />
    </service-create-step-container>
</template>
