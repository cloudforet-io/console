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
            <dashboard-template-form :dashboard-template.sync="dashboardTemplate" />
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
        const state = reactive({
            dashboardScope: undefined as undefined|DashboardScope,
            dashboardProject: undefined as undefined|ProjectItemResp,
            dashboardTemplate: '',
            dashboardViewerType: undefined as undefined|DashboardViewerType,
        });

        return { ...toRefs(state) };
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
