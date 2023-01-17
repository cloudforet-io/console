<template>
    <div class="dashboard-create-page">
        <p-page-title
            child
            :title="$t('DASHBOARDS.CREATE.TITLE')"
            @goBack="$router.go(-1)"
        />
        <section class="dashboard-create-form-container">
            <dashboard-scope-form :dashboard-scope.sync="dashboardScope"
                                  @set-project="setForm('dashboardProject', $event)"
            />
            <dashboard-template-form @set-template="setForm('dashboardTemplate', $event)" />
            <dashboard-viewer-form :dashboard-viewer-type.sync="dashboardViewerType" />
        </section>
        <div class="dashboard-create-buttons">
            <p-button style-type="tertiary"
                      size="lg"
                      @click="$router.go(-1)"
            >
                {{ $t('DASHBOARDS.CREATE.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      :disabled="!isAllValid"
                      @click="handleClickCreate"
            >
                {{ $t('DASHBOARDS.CREATE.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';

import { PPageTitle, PButton } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import {
    DASHBOARD_SCOPE,
    DASHBOARD_VIEWER,
} from '@/services/dashboards/config';
import type { DashboardScope, DashboardViewer } from '@/services/dashboards/config';
import DashboardScopeForm from '@/services/dashboards/dashboard-create/modules/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/dashboard-create/modules/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/dashboard-create/modules/DashboardViewerForm.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type { DashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import type { ProjectItemResp } from '@/services/project/type';


export default {
    name: 'CreateDashboardPage',
    components: {
        DashboardViewerForm,
        DashboardTemplateForm,
        DashboardScopeForm,
        PPageTitle,
        PButton,
    },
    setup() {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;
        const {
            forms: {
                dashboardTemplate,
                dashboardProject,
            },
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
        });

        const handleClickCreate = () => {
            let _dashboardTemplate;
            if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) {
                _dashboardTemplate = {
                    ...dashboardTemplate.value,
                    dashboard_id: undefined,
                    project_id: dashboardProject.value?.id ?? '',
                    viewers: state.dashboardViewerType,
                };
            } else {
                _dashboardTemplate = {
                    ...dashboardTemplate.value,
                    dashboard_id: undefined,
                    viewers: state.dashboardViewerType,
                };
            }

            dashboardDetailStore.setDashboardInfo(_dashboardTemplate);
            dashboardDetailState.dashboardId = undefined;
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
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-create-form-container {
    display: grid;
    grid-gap: 1rem;
}
.dashboard-create-buttons {
    display: inline-flex;
    float: right;
    margin-top: 1rem;
    & .p-button {
        margin-left: 1rem;
    }
}
</style>
