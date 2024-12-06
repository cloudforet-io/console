<script setup lang="ts">
import {
    computed, defineProps, onUnmounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, PCenteredLayoutHeader } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import WebhookCreateForm from '@/services/alert-manager-v2/components/WebhookCreateForm.vue';
import WebhookCreateSuccessMode from '@/services/alert-manager-v2/components/WebhookCreateSuccessMode.vue';
import WebhookCreateTypeSelector from '@/services/alert-manager-v2/components/WebhookCreateTypeSelector.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';
import type { createHeaderInfoByStep } from '@/services/alert-manager-v2/types/alert-manager-type';

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
    selectedWebhookTypeId: computed<string>(() => serviceCreateFormState.selectedWebhookType?.plugin_id || ''),
    webhookName: computed<string>(() => serviceCreateFormState.webhookName || ''),
});
const state = reactive({
    currentStep: 1,
    isAllFormValid: computed<boolean>(() => {
        if (state.currentStep === 1) return storeState.selectedWebhookTypeId !== '';
        return storeState.webhookName !== '';
    }),
    headerInfo: computed<createHeaderInfoByStep>(() => {
        if (state.currentStep === 1) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_TITLE'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_DESC'),
            };
        }
        if (state.currentStep === 2) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_TITLE'),
            };
        }
        return {
            title: i18n.t('ALERT_MANAGER.WEBHOOK.CREATE_SUCCESS_TITLE'),
        };
    }),
});

const handleClickCancelButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
        params: {
            serviceId: props.serviceId,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.WEBHOOK,
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
    fetchCreateWebhook();
};

const fetchCreateWebhook = () => {
    console.log('TODO: fetchCreateWebhook');
    state.currentStep = 3;
};

onUnmounted(() => {
    serviceCreateFormStore.initState();
});
</script>

<template>
    <div class="service-detail-webhook-create-page"
         :class="{'wide': state.currentStep === 1}"
    >
        <p-centered-layout-header :title="state.headerInfo.title"
                                  :description="state.headerInfo.desc"
                                  show-step
                                  :current-step="state.currentStep"
                                  :total-steps="3"
                                  :show-close-button="true"
                                  @close="handleClickCancelButton"
        />
        <webhook-create-type-selector v-if="state.currentStep === 1" />
        <webhook-create-form v-else-if="state.currentStep === 2" />
        <webhook-create-success-mode v-else-if="state.currentStep === 3" />
        <div class="flex justify-end mt-8">
            <p-button v-if="state.currentStep === 3"
                      style-type="transparent"
                      size="lg"
                      @click="handleClickCancelButton"
            >
                {{ $t('ALERT_MANAGER.CANCEL') }}
            </p-button>
            <div v-else
                 class="flex items-center gap-4"
            >
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
.service-detail-webhook-create-page {
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
