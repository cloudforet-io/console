<script setup lang="ts">
import {
    computed, defineProps, onUnmounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, PCenteredLayoutHeader } from '@cloudforet/mirinae';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import NotificationsCreateTypeSelector
    from '@/services/alert-manager-v2/components/NotificationsCreateTypeSelector.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/store/service-create-form-store';

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
    selectedProtocolId: computed<string>(() => serviceCreateFormState.selectedProtocol.protocol_id || ''),
});
const state = reactive({
    currentStep: 1,
    isAllFormValid: computed<boolean>(() => {
        if (state.currentStep === 1) return storeState.selectedProtocolId !== '';
        return true;
    }),
});

const handleClickCancelButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_V2_ROUTE.SERVICE.DETAIL._NAME,
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

const fetchCreateNotifications = () => {
    console.log('TODO: fetchCreateNotifications');
    handleClickCancelButton();
};

onUnmounted(() => {
    serviceCreateFormStore.initState();
});
</script>

<template>
    <div class="service-detail-notifications-create-page"
         :class="{'wide': state.currentStep === 1}"
    >
        <p-centered-layout-header :title="$t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_NOTIFICATIONS')"
                                  :description="$t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_DESC')"
                                  show-step
                                  :current-step="state.currentStep"
                                  :total-steps="2"
                                  :show-close-button="true"
                                  @close="handleClickCancelButton"
        />
        <notifications-create-type-selector v-if="state.currentStep === 1" />
        <div class="flex justify-end mt-8">
            <div class="flex items-center gap-4">
                <p-button style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="handlePrevNavigation"
                >
                    {{ $t('ALERT_MANAGER.SERVICE.GO_BACK') }}
                </p-button>
                <p-button :disabled="!state.isAllFormValid"
                          style-type="substitutive"
                          size="lg"
                          @click="handleActionButton"
                >
                    {{ state.currentStep === 1 ? $t('ALERT_MANAGER.CONTINUE') : $t('ALERT_MANAGER.CREATE') }}
                </p-button>
            </div>
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
