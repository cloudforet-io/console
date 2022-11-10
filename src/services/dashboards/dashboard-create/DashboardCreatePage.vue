<template>
    <div class="dashboard-create-page">
        <!--        song-lang-->
        <p-page-title
            child
            title="Create New Dashboard"
            @goBack="$router.go(-1)"
        />
        <section class="dashboard-create-form-container">
            <dashboard-scope-form :scope.sync="scope"
                                  :project.sync="project"
            />
            <dashboard-template-form :template.sync="template" />
            <dashboard-viewer-form :viewer-type.sync="viewerType" />
        </section>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';

import { PPageTitle } from '@spaceone/design-system';

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
    },
    setup() {
        const state = reactive({
            scope: undefined as undefined|DashboardScope,
            project: undefined as undefined|ProjectItemResp,
            template: '',
            viewerType: undefined as undefined|DashboardViewerType,
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
</style>
