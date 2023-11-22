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

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { DASHBOARD_SCOPE, DASHBOARD_VIEWER } from '@/schema/dashboard/_constants/dashboard-constant';
import type { DashboardScope, DashboardViewer } from '@/schema/dashboard/_types/dashboard-type';
import { store } from '@/store';
import { i18n } from '@/translations';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useGoBack } from '@/common/composables/go-back';

import DashboardCustomize from '@/services/dashboards/components/DashboardCustomize.vue';
import DashboardScopeForm from '@/services/dashboards/components/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/components/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/components/DashboardViewerForm.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-model-type';
import type { ProjectItemResp } from '@/services/project/type';


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const {
    forms: { dashboardTemplate, dashboardProject },
    setForm,
    isAllValid,
} = useFormValidator({
    dashboardTemplate: {} as DashboardModel,
    dashboardProject: undefined as undefined|ProjectItemResp,
}, {
    dashboardTemplate(value: DashboardModel) {
        return !Object.keys(value).length ? i18n.t('DASHBOARDS.CREATE.VALIDATION_TEMPLATE') : '';
    },
    dashboardProject(value: ProjectItemResp|undefined) {
        return !value && state.dashboardScope === DASHBOARD_SCOPE.PROJECT
            ? i18n.t('DASHBOARDS.CREATE.VALIDATION_PROJECT') : '';
    },
});

const state = reactive({
    loading: false,
    dashboardScope: DASHBOARD_SCOPE.DOMAIN as DashboardScope,
    dashboardViewerType: DASHBOARD_VIEWER.PUBLIC as DashboardViewer,
    steps: computed(() => [
        { step: 1, description: i18n.t('DASHBOARDS.CREATE.STEP1_DESC') },
        { step: 2, description: i18n.t('DASHBOARDS.CREATE.STEP2_DESC') },
        { step: 3 },
    ]),
    currentStep: 1,
    isValid: computed(() => {
        if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) return !!dashboardProject.value?.id;
        if (state.dashboardScope === DASHBOARD_SCOPE.DOMAIN) return true;
        return false;
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
    let _dashboardTemplate: DashboardModel;
    if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) {
        _dashboardTemplate = {
            ...dashboardTemplate.value,
            project_id: dashboardProject.value?.id ?? '',
            name: '',
            viewers: state.dashboardViewerType,
        };
    } else {
        _dashboardTemplate = {
            ...dashboardTemplate.value,
            name: '',
            viewers: state.dashboardViewerType,
        };
    }

    dashboardDetailStore.setDashboardInfo(_dashboardTemplate);
    dashboardDetailStore.$patch({
        dashboardId: undefined,
        placeholder: dashboardTemplate.value.name,
    });
};

const createDashboard = async () => {
    try {
        state.loading = true;

        const apiParam = {
            name: dashboardDetailState.name,
            labels: dashboardDetailState.labels,
            settings: dashboardDetailState.settings,
            layouts: [dashboardDetailState.dashboardWidgetInfoList],
            variables: dashboardDetailState.variables,
            variables_schema: dashboardDetailState.variablesSchema,
            tags: { created_by: store.state.user.userId },
            viewers: dashboardDetailStore.dashboardViewer,
        };
        if (dashboardDetailStore.isProjectDashboard) {
            const result = await SpaceConnector.clientV2.dashboard.projectDashboard.create({
                ...apiParam,
                project_id: dashboardDetailState.projectId,
            });
            dashboardDetailStore.$patch({ dashboardId: result.project_dashboard_id });
        } else {
            const result = await SpaceConnector.clientV2.dashboard.domainDashboard.create(apiParam);
            dashboardDetailStore.$patch({ dashboardId: result.domain_dashboard_id });
        }
        const routeName = dashboardDetailStore.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
        await SpaceRouter.router.push({
            name: routeName,
            params: {
                dashboardId: dashboardDetailState.dashboardId as string,
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
    name: DASHBOARDS_ROUTE.WORKSPACE._NAME,
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
            <dashboard-scope-form :dashboard-scope.sync="state.dashboardScope"
                                  @set-project="setForm('dashboardProject', $event)"
            />
            <dashboard-viewer-form :dashboard-viewer-type.sync="state.dashboardViewerType" />
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
                :dashboard-scope="state.dashboardScope"
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
