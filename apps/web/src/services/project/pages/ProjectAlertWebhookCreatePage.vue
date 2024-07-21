<script lang="ts" setup>
import { reactive } from 'vue';

import { PCenteredLayoutHeader } from '@cloudforet/mirinae';

import ProjectAlertWebhookCreateStep1 from '@/services/project/components/ProjectAlertWebhookCreateStep1.vue';

const state = reactive({
    step: 1,
    deleteModalVisible: false,
});

const handleClickClose = () => {
    state.deleteModalVisible = true;
};

const handleChangeStep = (step: number) => {
    state.step = step;
};
</script>

<template>
    <div class="project-alert-webhook-create-page">
        <p-centered-layout-header :title="$t('PROJECT.DETAIL.CREATE.TITLE')"
                                  :description="state.step === 1 && $t('PROJECT.DETAIL.CREATE.DESC')"
                                  show-step
                                  :current-step="state.step"
                                  :total-steps="2"
                                  @close="handleClickClose"
        />
        <project-alert-webhook-create-step1 v-if="state.step===1"
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
