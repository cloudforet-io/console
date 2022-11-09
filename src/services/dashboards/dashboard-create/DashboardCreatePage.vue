<template>
    <div class="dashboard-create-page">
        <!--        song-lang-->
        <p-page-title
            child
            title="Create New Dashboard"
            @goBack="$router.go(-1)"
        />
        <section class="dashboard-create-form-container">
            <dashboard-scope-form />
            <dashboard-template-form />
            <dashboard-viewer-form />
        </section>
    </div>
</template>

<script lang="ts">
import { PPageTitle } from '@spaceone/design-system';

import DashboardScopeForm from '@/services/dashboards/dashboard-create/modules/DashboardScopeForm.vue';
import DashboardTemplateForm from '@/services/dashboards/dashboard-create/modules/DashboardTemplateForm.vue';
import DashboardViewerForm from '@/services/dashboards/dashboard-create/modules/DashboardViewerForm.vue';

export default {
    name: 'CreateDashboardPage',
    components: {
        DashboardViewerForm,
        DashboardTemplateForm,
        DashboardScopeForm,
        PPageTitle,
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-create-form-container {
    display: grid;
    grid-gap: 1rem;
}
</style>
