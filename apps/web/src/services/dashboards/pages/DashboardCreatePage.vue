<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
import {
    computed, defineExpose, onUnmounted, reactive,
// eslint-disable-next-line import/no-duplicates
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PCenteredLayoutHeader,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import DashboardCreateStep1 from '@/services/dashboards/components/DashboardCreateStep1.vue';
import DashboardCreateStep2 from '@/services/dashboards/components/DashboardCreateStep2.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';


interface Step {
    step: number;
    description?: TranslateResult;
}
const appContextStore = useAppContextStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const { getProperRouteLocation } = useProperRouteLocation();
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    loading: false,
    steps: computed<Step[]>(() => [
        {
            step: 1,
            description: i18n.t('DASHBOARDS.CREATE.STEP1_DESC'),
        },
        {
            step: 2,
            description: state.isAdminMode ? i18n.t('DASHBOARDS.CREATE.STEP2_DESC_FOR_ADMIN') : i18n.t('DASHBOARDS.CREATE.STEP2_DESC'),
        },
    ]),
    isStep2Valid: false,
    closeConfirmModalVisible: false,
    disableCreateButton: computed<boolean>(() => {
        if (!dashboardCreatePageState.selectedDashboardId && !dashboardCreatePageState.selectedTemplateId) return true;
        return !state.isStep2Valid;
    }),
});

const goStep = (direction: 'prev'|'next') => {
    if (direction === 'prev') {
        dashboardCreatePageStore.reset();
        dashboardCreatePageStore.setCurrentStep(dashboardCreatePageState.currentStep - 1);
    } else {
        dashboardCreatePageStore.setCurrentStep(dashboardCreatePageState.currentStep + 1);
    }
};

const handleCreateDashboard = async () => {
    const createdDashboardId = await dashboardCreatePageStore.createDashboard();
    if (createdDashboardId) {
        await SpaceRouter.router.push(getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: createdDashboardId,
            },
        })).catch(() => {});
    }
};

/* Event */
const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};
const { setPathFrom, handleClickBackButton } = useGoBack(getProperRouteLocation({
    name: DASHBOARDS_ROUTE._NAME,
}));

defineExpose({ setPathFrom });

onUnmounted(() => {
    dashboardCreatePageStore.setCurrentStep(1);
    dashboardCreatePageStore.reset();
});
</script>

<template>
    <div class="dashboard-create-page"
         :class="[`step-${dashboardCreatePageState.currentStep}`]"
    >
        <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                  :description="state.steps?.[dashboardCreatePageState.currentStep - 1]?.description"
                                  :total-steps="state.steps.length"
                                  :current-step="dashboardCreatePageState.currentStep"
                                  show-step
                                  show-close-button
                                  @close="handleClickClose"
        />
        <dashboard-create-step1 v-if="dashboardCreatePageState.currentStep === 1" />
        <template v-else-if="dashboardCreatePageState.currentStep === 2">
            <dashboard-create-step2 :is-valid.sync="state.isStep2Valid" />
            <div class="button-area">
                <p-button style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          :disabled="dashboardCreatePageState.loading"
                          @click="goStep('prev')"
                >
                    {{ $t('DASHBOARDS.CREATE.GO_BACK') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          :disabled="state.disableCreateButton"
                          :loading="dashboardCreatePageState.loading"
                          @click="handleCreateDashboard"
                >
                    {{ $t('DASHBOARDS.CREATE.CREATE_NEW_DASHBOARD') }}
                </p-button>
            </div>
        </template>
        <confirm-back-modal :visible.sync="state.closeConfirmModalVisible"
                            @confirm="handleClickBackButton"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-page {
    &.step-1 {
        width: 60rem;
    }
    &.step-2 {
        width: 45rem;
    }
    &.step-3 {
        width: 100%;
        height: 100%;
        min-height: calc(100vh - 8rem);
    }
    .button-area {
        @apply flex justify-end mt-8 gap-4;
    }
}
</style>
