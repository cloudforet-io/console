<template>
    <div class="dashboard-create-page"
         :class="`step-${currentStep}`"
    >
        <template v-if="currentStep === steps[0].step">
            <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                      :description="steps[currentStep - 1].description"
                                      :total-steps="steps.length"
                                      :current-step="currentStep"
                                      show-step
                                      show-close-button
                                      @close="handleClickClose"
            />
            <dashboard-scope-form :dashboard-scope.sync="dashboardScope"
                                  @set-project="setForm('dashboardProject', $event)"
            />
            <dashboard-viewer-form :dashboard-viewer-type.sync="dashboardViewerType" />
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
                    :disabled="!isValid"
                    @click="goStep('next')"
                >
                    {{ $t('DASHBOARDS.CREATE.CONTINUE') }}
                </p-button>
            </div>
        </template>
        <template v-if="currentStep === steps[1].step">
            <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                      :description="steps[currentStep - 1].description"
                                      :total-steps="steps.length"
                                      :current-step="currentStep"
                                      show-step
                                      show-close-button
                                      @close="handleClickClose"
            />
            <dashboard-template-form
                :dashboard-scope="dashboardScope"
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
        </template>
        <template v-if="currentStep === steps[2].step">
            <div class="dashboard-customize-wrapper">
                <p-centered-layout-header :title="$t('DASHBOARDS.CREATE.TITLE')"
                                          :total-steps="steps.length"
                                          :current-step="currentStep"
                                          show-step
                                          show-close-button
                                          @close="handleClickClose"
                />
                <dashboard-customize :loading="loading"
                                     :save-button-text="$t('DASHBOARDS.CREATE.CREATE_NEW_DASHBOARD')"
                                     hide-cancel-button
                                     @go-back="goStep('prev')"
                                     @save="createDashboard"
                />
            </div>
        </template>
        <confirm-back-modal :visible.sync="closeConfirmModalVisible"
                            @confirm="handleClickBackButton"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, type ComponentPublicInstance,
} from 'vue';

import {
    PButton, PCenteredLayoutHeader,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useGoBack } from '@/common/composables/go-back';

import {
    DASHBOARD_SCOPE,
    DASHBOARD_VIEWER,
} from '@/services/dashboards/config';
import type { DashboardScope, DashboardViewer } from '@/services/dashboards/config';
import DashboardScopeForm from '@/services/dashboards/dashboard-create/modules/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/dashboard-create/modules/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/dashboard-create/modules/DashboardViewerForm.vue';
import DashboardCustomize from '@/services/dashboards/dashboard-customize/modules/DashboardCustomize.vue';
import type { DashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { ProjectItemResp } from '@/services/project/type';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default {
    name: 'CreateDashboardPage',
    components: {
        ConfirmBackModal,
        DashboardCustomize,
        DashboardViewerForm,
        DashboardTemplateForm,
        DashboardScopeForm,
        PButton,
        PCenteredLayoutHeader,
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
    setup() {
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
            let _dashboardTemplate;
            if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) {
                _dashboardTemplate = {
                    ...dashboardTemplate.value,
                    dashboard_id: undefined,
                    project_id: dashboardProject.value?.id ?? '',
                    name: '',
                    viewers: state.dashboardViewerType,
                };
            } else {
                _dashboardTemplate = {
                    ...dashboardTemplate.value,
                    dashboard_id: undefined,
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

        return {
            ...toRefs(state),
            dashboardTemplate,
            dashboardProject,
            setForm,
            isAllValid,
            goStep,
            createDashboard,
            handleClickClose,
            handleClickBackButton,
            setPathFrom,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-create-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    .button-area {
        @apply flex justify-end mt-8 gap-4;
    }
}
</style>
