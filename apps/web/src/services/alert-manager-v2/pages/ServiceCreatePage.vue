<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PCenteredLayoutHeader } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';

type headerInfoByStep = {
    title: TranslateResult;
    desc: TranslateResult;
};

const router = useRouter();

const state = reactive({
    step: 1,
    headerInfo: computed<headerInfoByStep>(() => {
        if (state.step === 1) {
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.CREATE_SERVICE_TITLE'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.CREATE_SERVICE_DESC'),
            };
        }
        if (state.step === 2) {
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
                                  :current-step="state.step"
                                  :total-steps="3"
                                  :show-close-button="true"
                                  @close="handleClickClose"
        />
    </div>
</template>
