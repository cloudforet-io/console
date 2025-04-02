<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PCenteredLayoutHeader } from '@cloudforet/mirinae';

import { i18n } from '@/translations';


import ServiceCreateStep1 from '@/services/alert-manager/v2/components/ServiceCreateStep1.vue';
import ServiceCreateStep2 from '@/services/alert-manager/v2/components/ServiceCreateStep2.vue';
import ServiceCreateStep3 from '@/services/alert-manager/v2/components/ServiceCreateStep3.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import type { createHeaderInfoByStep } from '@/services/alert-manager/v2/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;


const router = useRouter();

const storeState = reactive({
    step: computed<number>(() => serviceCreateFormState.currentStep),
    subStep: computed<number>(() => serviceCreateFormState.currentSubStep),
});
const state = reactive({
    headerInfo: computed<createHeaderInfoByStep>(() => {
        if (storeState.step === 1) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.CREATE_SERVICE_TITLE'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.CREATE_SERVICE_DESC'),
            };
        }
        if (storeState.step === 2) {
            if (storeState.subStep === 1) {
                return {
                    title: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_TITLE'),
                    desc: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_DESC'),
                };
            }
            if (storeState.subStep === 2) {
                return {
                    title: i18n.t('ALERT_MANAGER.SERVICE.CREATE_WEBHOOK_TITLE'),
                };
            }
            return {
                title: i18n.t('ALERT_MANAGER.WEBHOOK.CREATE_SUCCESS_TITLE'),
            };
        }
        return {
            title: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_NOTIFICATIONS'),
            desc: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_DESC'),
        };
    }),
    isWideLayout: computed<boolean>(() => {
        const wideLayoutSteps = [
            { step: 2, subStep: 1 },
            { step: 3, subStep: 1 },
        ];
        return wideLayoutSteps.some(
            ({ step, subStep }) => storeState.step === step && storeState.subStep === subStep,
        );
    }),
});

const handleClickClose = () => {
    router.push({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }).catch(() => {});
};

onUnmounted(() => {
    serviceCreateFormStore.initState();
    serviceCreateFormStore.$dispose();
});
</script>

<template>
    <div class="service-create-page"
         :class="{'wide': state.isWideLayout}"
    >
        <p-centered-layout-header :title="state.headerInfo.title"
                                  :description="state.headerInfo.desc"
                                  show-step
                                  :current-step="storeState.step"
                                  :total-steps="3"
                                  :show-close-button="true"
                                  @close="handleClickClose"
        />
        <service-create-step1 v-if="storeState.step === 1" />
        <service-create-step2 v-if="storeState.step === 2" />
        <service-create-step3 v-if="storeState.step === 3" />
    </div>
</template>

<style scoped lang="postcss">
.service-create-page {
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
