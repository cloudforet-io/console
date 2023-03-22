<template>
    <div class="dashboard-create-page">
        <div v-if="currentStep === steps[0].step"
             class="dashboard-create-step1"
        >
            <dashboard-create-header
                :description="steps[0].description"
                :total-steps="steps.length"
                :current-step="currentStep"
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
                    :loading="false"
                    :disabled="!valid"
                    @click="handleGoStep(2)"
                >
                    {{ $t('DASHBOARDS.CREATE.CONTINUE') }}
                </p-button>
            </div>
        </div>
        <div v-if="currentStep === steps[1].step"
             class="dashboard-create-step2 max-w-lg2"
        >
            <dashboard-create-header
                :description="steps[1].description"
                :total-steps="steps.length"
                :current-step="currentStep"
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
                    @click="handleGoStep(1)"
                >
                    {{ $t('DASHBOARDS.CREATE.GO_BACK') }}
                </p-button>
                <p-button
                    style-type="primary"
                    size="lg"
                    :disabled="!isAllValid"
                    @click="handleClickCreate"
                >
                    {{ $t('DASHBOARDS.CREATE.CREATE_NEW_DASHBOARD') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import {
    PButton,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import {
    DASHBOARD_SCOPE,
    DASHBOARD_VIEWER,
} from '@/services/dashboards/config';
import type { DashboardScope, DashboardViewer } from '@/services/dashboards/config';
import DashboardCreateHeader from '@/services/dashboards/dashboard-create/modules/DashboardCreateHeader.vue';
import DashboardScopeForm from '@/services/dashboards/dashboard-create/modules/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/dashboard-create/modules/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/dashboard-create/modules/DashboardViewerForm.vue';
import type { DashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { ProjectItemResp } from '@/services/project/type';


export default {
    name: 'CreateDashboardPage',
    components: {
        DashboardCreateHeader,
        DashboardViewerForm,
        DashboardTemplateForm,
        DashboardScopeForm,
        PButton,
    },
    setup() {
        const dashboardDetailStore = useDashboardDetailInfoStore();
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
            dashboardScope: DASHBOARD_SCOPE.DOMAIN as DashboardScope,
            dashboardViewerType: DASHBOARD_VIEWER.PUBLIC as DashboardViewer,
            steps: [
                { step: 1, description: i18n.t('DASHBOARDS.CREATE.STEP1_DESC') },
                { step: 2, description: i18n.t('DASHBOARDS.CREATE.STEP2_DESC') },
            ],
            currentStep: 1,
            valid: computed(() => {
                if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) return !!dashboardProject.value?.id;
                if (state.dashboardScope === DASHBOARD_SCOPE.DOMAIN) return true;
                return false;
            }),
        });


        const handleGoStep = (step) => {
            state.currentStep = step;
        };
        const handleClickCreate = () => {
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
            const routeName = state.dashboardScope === DASHBOARD_SCOPE.PROJECT ? DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME : DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME;
            SpaceRouter.router.push({ name: routeName });
        };

        return {
            ...toRefs(state),
            dashboardTemplate,
            dashboardProject,
            setForm,
            isAllValid,
            handleClickCreate,
            handleGoStep,
        };
    },
};
</script>

<style lang="postcss" scoped>
.button-area {
    @apply flex justify-end mt-8 gap-4;
}
.dashboard-create-step1 {
    @apply w-full;
    max-width: 30rem;
    padding: 2.5rem;
    margin: 0 auto;

    @screen tablet {
        @apply w-full;
    }
}
.dashboard-create-step2 {
    width: 62.5rem;
    margin: 0 auto;
    padding: 2rem 1.5rem 4.0625rem;

    @screen tablet {
        @apply w-full p-8;

        .button-area {
            @apply flex-col w-full mt-4;
        }
    }
    .dashboard-create-header {
        @apply mb-8;
    }
}
</style>
