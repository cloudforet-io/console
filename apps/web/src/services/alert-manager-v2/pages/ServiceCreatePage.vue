<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PCenteredLayoutHeader } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ServiceCreateStep1 from '@/services/alert-manager-v2/components/ServiceCreateStep1.vue';
import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceFormStore } from '@/services/alert-manager-v2/store/service-form-store';

type headerInfoByStep = {
    title: TranslateResult;
    desc: TranslateResult;
};

const serviceFormStore = useServiceFormStore();
const serviceFormState = serviceFormStore.state;

const router = useRouter();

const storeState = reactive({
    step: computed(() => serviceFormState.currentStep),
});
const state = reactive({
    headerInfo: computed<headerInfoByStep>(() => {
        if (storeState.step === 1) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.CREATE_SERVICE_TITLE'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.CREATE_SERVICE_DESC'),
            };
        }
        if (storeState.step === 2) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_TITLE'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.INTEGRATE_TOOL_DESC'),
            };
        }
        return {
            title: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_NOTIFICATIONS'),
            desc: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SET_UP_DESC'),
        };
    }),
});

const handleClickClose = () => {
    router.push({ name: ALERT_MANAGER_V2_ROUTE.SERVICE._NAME });
};
</script>

<template>
    <div class="service-create-page">
        <p-centered-layout-header :title="state.headerInfo.title"
                                  :description="state.headerInfo.desc"
                                  show-step
                                  :current-step="storeState.step"
                                  :total-steps="3"
                                  :show-close-button="true"
                                  @close="handleClickClose"
        />
        <service-create-step1 v-if="storeState.step === 1" />
    </div>
</template>

<style scoped lang="postcss">
.service-create-page {
    max-width: 45rem;
    padding-right: 2.5rem;
    padding-left: 2.5rem;
}
</style>
