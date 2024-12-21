<script setup lang="ts">
import {
    computed, defineProps, onUnmounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton, PCenteredLayoutHeader } from '@cloudforet/mirinae';

import type { ServiceChannelCreateParameters } from '@/schema/alert-manager/service-channel/api-verbs/create';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import NotificationsCreateForm from '@/services/alert-manager-v2/components/NotificationsCreateForm.vue';
import NotificationsCreateTypeSelector
    from '@/services/alert-manager-v2/components/NotificationsCreateTypeSelector.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';
import type { CreatedNotificationInfoType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    selectedProtocolId: computed<string>(() => serviceCreateFormState.selectedProtocol?.protocol_id || ''),
});
const state = reactive({
    currentStep: 1,
    form: {} as CreatedNotificationInfoType,
    isAllFormValid: computed<boolean>(() => {
        if (state.currentStep === 1) return storeState.selectedProtocolId !== '';
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

const handleChangeForm = (form: CreatedNotificationInfoType) => {
    state.form = form;
};
const handleClickCancelButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
        params: {
            serviceId: props.serviceId,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.NOTIFICATIONS,
        },
    }));
};
const handlePrevNavigation = () => {
    if (state.currentStep === 1) {
        handleClickCancelButton();
        return;
    }

    state.currentStep -= 1;
};

const handleActionButton = () => {
    if (state.currentStep === 1) {
        state.currentStep = 2;
        return;
    }
    fetchCreateNotifications();
};

const fetchCreateNotifications = async () => {
    try {
        await SpaceConnector.clientV2.alertManager.serviceChannel.create<ServiceChannelCreateParameters, ServiceChannelModel>({
            protocol_id: storeState.selectedProtocolId,
            service_id: props.serviceId,
            ...state.form,
        });
        handleClickCancelButton();
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

onUnmounted(() => {
    serviceCreateFormStore.initState();
});
</script>

<template>
    <div class="service-detail-notifications-create-page"
         :class="{'wide': state.currentStep === 1}"
    >
        <p-centered-layout-header :title="$t('ALERT_MANAGER.NOTIFICATIONS.CREATE_TITLE')"
                                  :description="$t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_DESC')"
                                  show-step
                                  :current-step="state.currentStep"
                                  :total-steps="2"
                                  :show-close-button="true"
                                  @close="handleClickCancelButton"
        />
        <notifications-create-type-selector v-if="state.currentStep === 1" />
        <notifications-create-form v-if="state.currentStep === 2"
                                   @change-form="handleChangeForm"
        />
        <div class="flex justify-end mt-8">
            <p-button v-if="state.currentStep === 1"
                      style-type="tertiary"
                      size="lg"
                      @click="handleClickCancelButton"
            >
                {{ $t('ALERT_MANAGER.CANCEL') }}
            </p-button>
            <p-button v-else
                      style-type="transparent"
                      size="lg"
                      icon-left="ic_arrow-left"
                      @click="handlePrevNavigation"
            >
                {{ $t('ALERT_MANAGER.SERVICE.GO_BACK') }}
            </p-button>
            <p-button :disabled="!state.isAllFormValid"
                      :style-type="state.currentStep === 1 ? 'substitutive' : 'primary'"
                      size="lg"
                      class="ml-4"
                      @click="handleActionButton"
            >
                {{ state.currentStep === 1 ? $t('ALERT_MANAGER.CONTINUE') : $t('ALERT_MANAGER.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-notifications-create-page {
    min-width: 45rem;
    max-width: 45rem;
    padding-right: 2.5rem;
    padding-left: 2.5rem;
    &.wide {
        max-width: 59.5rem;
        padding-right: 0;
        padding-left: 0;
    }
}
</style>
