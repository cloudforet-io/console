<script setup lang="ts">
import {
    computed, defineProps, onUnmounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, PCenteredLayoutHeader } from '@cloudforet/mirinae';

import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { i18n } from '@/translations';

import WebhookCreateForm from '@/services/alert-manager/v2/components/WebhookCreateForm.vue';
import WebhookCreateSuccessMode from '@/services/alert-manager/v2/components/WebhookCreateSuccessMode.vue';
import WebhookCreateTypeSelector from '@/services/alert-manager/v2/components/WebhookCreateTypeSelector.vue';
import { useWebhookCreateMutation } from '@/services/alert-manager/v2/composables/use-webhook-create-mutation';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import type { createHeaderInfoByStep } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const router = useRouter();


const storeState = reactive({
    selectedWebhookType: computed<PluginModel|undefined>(() => serviceCreateFormState.selectedWebhookType),
    selectedWebhookTypeId: computed<string>(() => serviceCreateFormState.selectedWebhookType?.plugin_id || ''),
    webhookName: computed<string>(() => serviceCreateFormState.webhookName || ''),
    webhookVersion: computed<string|undefined>(() => serviceCreateFormState.webhookVersion || ''),
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
                title: i18n.t('ALERT_MANAGER.SERVICE.CREATE_WEBHOOK_TITLE'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_DESC'),
            };
        }
        if (state.currentStep === 2) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.CREATE_WEBHOOK_TITLE'),
            };
        }
        return {
            title: i18n.t('ALERT_MANAGER.WEBHOOK.CREATE_SUCCESS_TITLE'),
        };
    }),
    succeedWebhook: undefined as undefined|WebhookModel,
});

const { mutateAsync: createWebhook, isPending: createWebhookLoading } = useWebhookCreateMutation({
    onSuccess: (data) => {
        state.succeedWebhook = data as WebhookModel;
        state.currentStep = 3;
    },
    onError: () => {
        state.succeedWebhook = undefined;
    },
});

const handleClickCancelButton = () => {
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: props.serviceId,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.WEBHOOK,
        },
    }).catch(() => {});
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

const fetchCreateWebhook = async () => {
    createWebhook({
        name: storeState.webhookName,
        plugin_info: {
            plugin_id: storeState.selectedWebhookType?.plugin_id || '',
            version: storeState.webhookVersion,
        },
        service_id: props.serviceId,
    });
};

onUnmounted(() => {
    serviceCreateFormStore.initState();
    serviceCreateFormStore.$dispose();
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
        <webhook-create-success-mode v-else-if="state.currentStep === 3"
                                     :succeed-webhook="state.succeedWebhook"
        />
        <div class="flex justify-end mt-8">
            <p-button v-if="state.currentStep === 1"
                      style-type="transparent"
                      size="lg"
                      @click="handleClickCancelButton"
            >
                {{ $t('ALERT_MANAGER.CANCEL') }}
            </p-button>
            <p-button v-else-if="state.currentStep === 2"
                      style-type="transparent"
                      size="lg"
                      icon-left="ic_arrow-left"
                      @click="handlePrevNavigation"
            >
                {{ $t('ALERT_MANAGER.SERVICE.GO_BACK') }}
            </p-button>
            <p-button v-if="state.currentStep === 3"
                      size="lg"
                      class="ml-4"
                      @click="handleClickCancelButton"
            >
                {{ $t('ALERT_MANAGER.DONE') }}
            </p-button>
            <p-button v-else
                      :disabled="!state.isAllFormValid"
                      style-type="substitutive"
                      size="lg"
                      class="ml-4"
                      :loading="createWebhookLoading"
                      @click="handleActionButton"
            >
                {{ state.currentStep === 1 ? $t('ALERT_MANAGER.CONTINUE') : $t('ALERT_MANAGER.CREATE') }}
            </p-button>
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

    @screen tablet {
        min-width: unset;
    }
}
</style>
