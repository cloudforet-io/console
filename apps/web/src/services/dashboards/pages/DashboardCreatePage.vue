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

import DashboardCustomize from '@/services/dashboards/components/DashboardCustomize.vue';
import DashboardScopeForm from '@/services/dashboards/components/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/components/DashboardTemplateForm.vue';
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
const {
    forms: { dashboardTemplate, dashboardProject },
    setForm,
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
            variables_schema: dashboardDetailState.variablesSchema,
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

const handleClickClose = () => {
    state.closeConfirmModalVisible = true;
};

const { setPathFrom, handleClickBackButton } = useGoBack({
    name: DASHBOARDS_ROUTE._NAME,
});

defineExpose({ setPathFrom });
</script>

<template>
    <div class="dashboard-create-page"
         :class="`step-${state.currentStep}`"
    >
        <div v-if="state.currentStep === state.steps[0].step">
            <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                      :description="state.steps[state.currentStep - 1].description"
                                      :total-steps="state.steps.length"
                                      :current-step="state.currentStep"
                                      show-step
                                      show-close-button
                                      @close="handleClickClose"
            />
            <dashboard-scope-form @set-project="setForm('dashboardProject', $event)" />
            <div class="button-area">
                <p-button
                    style-type="transparent"
                    size="lg"
                    @click="$router.go(-1)"
                >
                    {{ $t('DASHBOARDS.CREATE.CANCEL') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="lg"
                    :disabled="!state.isValid"
                    @click="goStep('next')"
                >
                    {{ $t('DASHBOARDS.CREATE.CONTINUE') }}
                </p-button>
            </div>
        </div>
        <div v-if="state.currentStep === state.steps[1].step">
            <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                      :description="state.steps[state.currentStep - 1].description"
                                      :total-steps="state.steps.length"
                                      :current-step="state.currentStep"
                                      show-step
                                      show-close-button
                                      @close="handleClickClose"
            />
            <dashboard-template-form
                :dashboard-scope="dashboardDetailState.dashboardScope"
                @set-template="setForm('dashboardTemplate', $event)"
            />
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
        </div>
        <div v-if="state.currentStep === state.steps[2].step">
            <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                      :total-steps="state.steps.length"
                                      :current-step="state.currentStep"
                                      show-step
                                      show-close-button
                                      @close="handleClickClose"
            />
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
    min-width: 25rem;
    &.step-2 {
        @apply absolute;
        top: 2rem;
        width: 100%;
        max-width: 1000px;
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
