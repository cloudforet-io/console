<template>
    <div class="dashboard-create-page">
        <!--        song-lang-->
        <p-page-title
            child
            title="Create New Dashboard"
            @goBack="$router.go(-1)"
        />
        <section class="dashboard-create-form-container">
            <dashboard-scope-form :dashboard-scope.sync="dashboardScope"
                                  :dashboard-project.sync="dashboardProject"
            />
            <dashboard-template-form @set-template="(t) => setForm('dashboardTemplate', t)" />
            <dashboard-viewer-form :dashboard-viewer-type.sync="dashboardViewerType" />
        </section>
        <div class="dashboard-create-buttons">
            <p-button style-type="tertiary"
                      size="lg"
                      @click="$router.go(-1)"
            >
                <!--                song-lang-->
                Cancel
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      :disabled="!isAllValid"
                      @click="handleClickCreate"
            >
                <!--                song-lang-->
                Create
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';

import { PPageTitle, PButton } from '@spaceone/design-system';

import { useFormValidator } from '@/common/composables/form-validator';

import { DASHBOARD_SCOPE_ENTIRE, DASHBOARD_VIEWER_PUBLIC } from '@/services/dashboards/dashboard-create/config';
import DashboardScopeForm from '@/services/dashboards/dashboard-create/modules/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/dashboard-create/modules/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/dashboard-create/modules/DashboardViewerForm.vue';
import type { DashboardScope, DashboardViewerType } from '@/services/dashboards/dashboard-create/type';
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
            },
            setForm,
            isAllValid,
        } = useFormValidator({
            dashboardTemplate: '',
        }, {
            dashboardTemplate(value: boolean) { return !value ? 'Please Select Project' : ''; },
        });

        const state = reactive({
            dashboardScope: DASHBOARD_SCOPE_ENTIRE as DashboardScope,
            dashboardProject: undefined as undefined|ProjectItemResp,
            dashboardViewerType: DASHBOARD_VIEWER_PUBLIC as DashboardViewerType,
        });

        const handleClickCreate = () => {
            const createDashboardFormData = {
                dashboardScope: state.dashboardScope,
                dashboardProject: state.dashboardScope === DASHBOARD_SCOPE_ENTIRE ? '' : state.dashboardProject,
                dashboardTemplate: dashboardTemplate.value,
                dashboardViewerType: state.dashboardViewerType,
            };
            console.log(createDashboardFormData);
        };

        return {
            ...toRefs(state),
            dashboardTemplate,
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
