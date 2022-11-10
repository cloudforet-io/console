<template>
    <section>
        <p-pane-layout>
            <!--            song-lang-->
            <p-panel-top title="Dashboard Scope" />
            <div class="dashboard-scope-wrapper">
                <p-radio-group direction="vertical">
                    <p-radio :selected="isEntireScope"
                             @change="handleSelectScope(DASHBOARD_ENTIRE_SCOPE)"
                    >
                        <!--                    song-lang-->
                        Entire Workspaces
                    </p-radio>
                    <p-radio :selected="!isEntireScope"
                             @change="handleSelectScope(DASHBOARD_SINGLE_SCOPE)"
                    >
                        <!--                    song-lang-->
                        Single Project
                    </p-radio>
                </p-radio-group>
                <project-select-dropdown v-show="!isEntireScope"
                                         project-selectable
                                         @select="handleSelectProject"
                />
            </div>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import { defineComponent, reactive, toRefs } from 'vue';

import {
    PPaneLayout, PPanelTop, PRadio, PRadioGroup,
} from '@spaceone/design-system';

import { store } from '@/store';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { DASHBOARD_ENTIRE_SCOPE, DASHBOARD_SINGLE_SCOPE } from '@/services/dashboards/dashboard-create/config';
import type { DashboardScope } from '@/services/dashboards/dashboard-create/type';

export default defineComponent({
    name: 'DashboardScopeForm',
    components: {
        ProjectSelectDropdown,
        PRadioGroup,
        PRadio,
        PPanelTop,
        PPaneLayout,
    },
    props: {
        scope: {
            type: String as PropType<DashboardScope>,
            default: undefined,
        },
        project: {
            type: Array as PropType<Array<string>>,
            default: () => [],
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            isEntireScope: undefined as undefined|boolean,
        });

        const handleSelectScope = (scopeType: DashboardScope) => {
            state.isEntireScope = scopeType === DASHBOARD_ENTIRE_SCOPE;
            emit('update:scope', scopeType);
        };

        const handleSelectProject = (project: Array<string>) => {
            emit('update:project', project);
        };

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/project/load');
        })();

        return {
            ...toRefs(state),
            handleSelectScope,
            handleSelectProject,
            DASHBOARD_ENTIRE_SCOPE,
            DASHBOARD_SINGLE_SCOPE,
        };
    },
});
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
