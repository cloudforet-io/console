<template>
    <section>
        <p-pane-layout>
            <!--            song-lang-->
            <p-panel-top title="Dashboard Scope" />
            <div class="dashboard-scope-wrapper">
                <p-radio-group direction="vertical">
                    <!--                    song-lang-->
                    <p-radio>Entire Workspaces</p-radio>
                    <!--                    song-lang-->
                    <p-radio>Single Project</p-radio>
                </p-radio-group>
                <project-select-dropdown />
            </div>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PRadio, PRadioGroup,
} from '@spaceone/design-system';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

export default {
    name: 'DashboardScopeForm',
    components: {
        ProjectSelectDropdown,
        PRadioGroup,
        PRadio,
        PPanelTop,
        PPaneLayout,
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-scope-wrapper {
    .p-radio-group {
        display: grid;
        grid-gap: 0.875rem;
    }
    .project-select-dropdown {
        margin: 0.375rem 0 0 1.125rem;
    }
    margin: 0.5rem 1rem 2.25rem;
}
</style>
