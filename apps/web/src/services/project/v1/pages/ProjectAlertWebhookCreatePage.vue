<script lang="ts" setup>
import { reactive } from 'vue';

import { PCenteredLayoutHeader } from '@cloudforet/mirinae';

import ProjectAlertWebhookCreateStep1 from '@/services/project/v1/components/ProjectAlertWebhookCreateStep1.vue';
import ProjectAlertWebhookCreateStep2 from '@/services/project/v1/components/ProjectAlertWebhookCreateStep2.vue';
import type { WebhookType } from '@/services/project/v1/types/project-alert-type';

const state = reactive({
    step: 1,
    deleteModalVisible: false,
    selectedWebhookType: {} as WebhookType,
});

const handleClickClose = () => {
    state.deleteModalVisible = true;
};

const handleChangeStep = (step: number, item?: WebhookType) => {
    state.step = step;
    if (item) {
        state.selectedWebhookType = item;
    }
};
</script>

<template>
    <div class="project-alert-webhook-create-page">
        <p-centered-layout-header :title="$t('PROJECT.DETAIL.CREATE_WEBHOOK_TITLE')"
                                  :description="state.step === 1 && $t('PROJECT.DETAIL.CREATE_WEBHOOK_DESC')"
                                  show-step
                                  :current-step="state.step"
                                  :total-steps="2"
                                  @close="handleClickClose"
        />
        <project-alert-webhook-create-step1 v-if="state.step === 1"
                                            @update:currentStep="handleChangeStep"
        />
        <project-alert-webhook-create-step2 v-else-if="state.step === 2"
                                            :selected-type="state.selectedWebhookType"
                                            @update:currentStep="handleChangeStep"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-alert-webhook-create-page {
    display: flex;
    flex-direction: column;
}
</style>
