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
// eslint-disable-next-line import/order,import/no-duplicates
import { computed, defineExpose, reactive } from 'vue';

import {
    PButton, PCenteredLayoutHeader,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import { store } from '@/store';
import { i18n } from '@/translations';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useGoBack } from '@/common/composables/go-back';

import DashboardCreateStep1 from '@/services/dashboards/components/DashboardCreateStep1.vue';
import DashboardCreateStep2 from '@/services/dashboards/components/DashboardCreateStep2.vue';
import DashboardCustomize from '@/services/dashboards/components/DashboardCustomize.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { CreateDashboardParameters, DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';
import type { ProjectTreeNodeData } from '@/services/project/types/project-tree-type';

interface Step {
    step: number;
    description?: string;
}
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const {
    forms: { dashboardTemplate, dashboardProject },
    // setForm,
    isAllValid,
} = useFormValidator({
    dashboardTemplate: {} as DashboardModel,
    dashboardProject: undefined as undefined|ProjectTreeNodeData,
}, {
    dashboardTemplate(value: DashboardModel) {
        return !Object.keys(value).length ? i18n.t('DASHBOARDS.CREATE.VALIDATION_TEMPLATE') : '';
    },
    dashboardProject(value: ProjectTreeNodeData|undefined) {
        return !value && dashboardDetailState.dashboardScope === 'PROJECT'
            ? i18n.t('DASHBOARDS.CREATE.VALIDATION_PROJECT') : '';
    },
});

const state = reactive({
    loading: false,
    steps: computed<Step[]>(() => [
        { step: 1, description: i18n.t('DASHBOARDS.CREATE.STEP1_DESC') as string },
        { step: 2, description: i18n.t('DASHBOARDS.CREATE.STEP2_DESC') as string },
        { step: 3 },
    ]),
    currentStep: 1,
    isValid: computed(() => {
        if (dashboardDetailState.dashboardScope === 'PROJECT') return !!dashboardProject.value?.id;
        return true;
    }),
    closeConfirmModalVisible: false,
});

const goStep = (direction: 'prev'|'next') => {
    if (state.currentStep === 2 && direction === 'next') {
        saveCurrentStateToStore();
    }
    if (direction === 'prev') state.currentStep--;
    else state.currentStep++;
};

const saveCurrentStateToStore = () => {
    dashboardDetailStore.setProjectId(dashboardDetailState.dashboardScope === 'PROJECT' ? dashboardProject.value?.id : undefined);
    dashboardDetailStore.setDashboardTemplate(dashboardTemplate.value);
};

const createDashboard = async () => {
    try {
        state.loading = true;

        const apiParam: CreateDashboardParameters = {
            name: dashboardDetailState.name,
            labels: dashboardDetailState.labels,
            settings: dashboardDetailState.settings,
            layouts: [dashboardDetailState.dashboardWidgetInfoList],
            variables: dashboardDetailState.variables,
            variables_schema: dashboardDetailGetters.refinedVariablesSchema,
            tags: { created_by: store.state.user.userId },
        };
        if (dashboardDetailState.dashboardScope !== 'PRIVATE') {
            (apiParam as PublicDashboardCreateParameters).resource_group = dashboardDetailState.dashboardScope;
        }
        if (dashboardDetailState.dashboardScope === 'PROJECT') {
            (apiParam as PublicDashboardCreateParameters).project_id = dashboardDetailState.projectId;
        }

        const createdDashboard = await dashboardDetailStore.createDashboard(apiParam);
        await SpaceRouter.router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: createdDashboard.public_dashboard_id || createdDashboard.private_dashboard_id || '',
            },
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.CUSTOMIZE.ALT_E_UPDATE_DASHBOARD'));
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};
const handleSelectTemplate = () => {
    // TODO: set template
    goStep('next');
};

const { setPathFrom, handleClickBackButton } = useGoBack({
    name: DASHBOARDS_ROUTE.ALL._NAME,
});

defineExpose({ setPathFrom });
</script>

<template>
    <div class="dashboard-create-page"
         :class="`step-${state.currentStep}`"
    >
        <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                  :description="state.steps[state.currentStep - 1].description"
                                  :total-steps="state.steps.length"
                                  :current-step="state.currentStep"
                                  show-step
                                  show-close-button
                                  @close="handleClickClose"
        />
        <dashboard-create-step1 v-if="state.currentStep === 1"
                                @select-template="handleSelectTemplate"
        />
        <template v-else-if="state.currentStep === 2">
            <dashboard-create-step2 />
            <div class="button-area">
                <p-button
                    style-type="transparent"
                    size="lg"
                    icon-left="ic_arrow-left"
                    @click="goStep('prev')"
                >
                    {{ $t('DASHBOARDS.CREATE.GO_BACK') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="lg"
                    :disabled="!isAllValid"
                    @click="goStep('next')"
                >
                    {{ $t('DASHBOARDS.CREATE.CONTINUE') }}
                </p-button>
            </div>
        </template>
        <div v-if="state.currentStep === 3">
            <dashboard-customize :loading="state.loading"
                                 :save-button-text="$t('DASHBOARDS.CREATE.CREATE_NEW_DASHBOARD')"
                                 hide-cancel-button
                                 @go-back="goStep('prev')"
                                 @save="createDashboard"
            />
        </div>
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
