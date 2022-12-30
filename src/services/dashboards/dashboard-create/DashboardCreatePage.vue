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

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import {
    DASHBOARD_SCOPE,
    DASHBOARD_VIEWER,
} from '@/services/dashboards/config';
import type { DashboardScope, DashboardViewer } from '@/services/dashboards/config';
import DashboardScopeForm from '@/services/dashboards/dashboard-create/modules/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/dashboard-create/modules/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/dashboard-create/modules/DashboardViewerForm.vue';
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
        const {
            forms: {
                dashboardTemplate,
                dashboardProject,
            },
            setForm,
            isAllValid,
        } = useFormValidator({
            dashboardTemplate: '',
            dashboardProject: undefined as ProjectItemResp|undefined,
        }, {
            dashboardTemplate(value: boolean) { return !value ? i18n.t('DASHBOARDS.CREATE.VALIDATION_TEMPLATE') : ''; },
            dashboardProject(value: ProjectItemResp|undefined) {
                return !value && state.dashboardScope === DASHBOARD_SCOPE.PROJECT
                    ? i18n.t('DASHBOARDS.CREATE.VALIDATION_PROJECT') : '';
            },
        });

        const state = reactive({
            dashboardScope: DASHBOARD_SCOPE.DOMAIN as DashboardScope,
            dashboardViewerType: DASHBOARD_VIEWER.PUBLIC as DashboardViewer,
        });

        const handleClickCreate = async () => {
            const dashboardCreateParams = {
                // TODO:: connect real name after bind templates
                name: `${state.dashboardScope} ${state.dashboardViewerType} dashboard - ${(Math.random().toString().slice(3, 6))}`,
                viewers: state.dashboardViewerType,
            };

            try {
                let dashboardId = '';
                if (state.dashboardScope === DASHBOARD_SCOPE.PROJECT) {
                    const result = await SpaceConnector.clientV2.dashboard.projectDashboard.create({
                        ...dashboardCreateParams,
                        project_id: dashboardProject.value?.id ?? '',
                    });
                    dashboardId = result.project_dashboard_id;
                } else {
                    const result = await SpaceConnector.clientV2.dashboard.domainDashboard.create(dashboardCreateParams);
                    dashboardId = result.domain_dashboard_id;
                }
                await SpaceRouter.router.push({
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    params: {
                        dashboardId,
                        dashboardScope: state.dashboardScope,
                    },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
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
