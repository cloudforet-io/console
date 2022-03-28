<template>
    <p-pane-layout>
        <div class="panel-container">
            <div class="tree-panel-header">
                <span class="title">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE') }}</span>
                <p-icon-text-button style-type="primary" name="ic_plus_bold" outline
                                    @click="goToProject"
                >
                    {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_CREATE') }}
                </p-icon-text-button>
            </div>
            <div class="body-container">
                <div class="radio-row">
                    <p-radio v-model="selectedToggle"
                             class="mr-2"
                             :value="true"
                             @click="handleToggle"
                    >
                        <span class="radio-text">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_NO_SELECTION') }}</span>
                    </p-radio>
                </div>
                <div class="radio-row">
                    <p-radio v-model="selectedToggle"
                             class="mr-2"
                             :value="false"
                             @click="handleToggle"
                    >
                        <span class="radio-text">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_SELECT_DESC') }}</span>
                    </p-radio>
                    <div class="search-radio">
                        <project-select-dropdown class="project-search-dropdown"
                                                 project-selectable
                                                 :disabled="selectedToggle"
                                                 :selected-project-ids="selectedProject"
                                                 :use-fixed-menu-style="false"
                                                 @select="handleSelectedProjectIds"
                        />
                    </div>
                </div>
            </div>
            <slot name="bottom" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PPaneLayout, PIconTextButton, PRadio,
} from '@spaceone/design-system';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ProjectGroupTreeItem } from '@/services/project/type';
import { ProjectGroup } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ProjectTreePanel',
    components: {
        PPaneLayout,
        PIconTextButton,
        PRadio,
        ProjectSelectDropdown,
    },
    props: {
        targetName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            selectedProject: [] as ProjectGroupTreeItem[],
            selectedToggle: true,
        });

        const projectPath = vm?.$router.resolve({ name: PROJECT_ROUTE._NAME }).href;
        const goToProject = () => {
            window.open(projectPath);
        };

        const handleSelectedProjectIds = (selectedProject) => {
            state.selectedProject = selectedProject;
            emit('select', state.selectedProject.length ? selectedProject[0] as ProjectGroup : null);
        };

        const handleToggle = () => {
            if (state.selectedToggle) emit('select', null);
            else if (state.selectedProject.length) emit('select', state.selectedProject[0] as ProjectGroup);
        };
        return {
            ...toRefs(state),
            goToProject,
            handleToggle,
            handleSelectedProjectIds,
        };
    },

};
</script>

<style lang="postcss" scoped>
.panel-container {
    max-width: 35.75rem;
}
.toolbox {
    @apply flex mb-2 mt-5 align-middle items-center justify-between;
    .msg {
        @apply align-middle font-bold;
        .alert {
            @apply text-alert font-normal;
        }
    }
    .refresh-btn {
        @apply flex-shrink-0;
    }
}
.tree {
    @apply overflow-auto border-gray-200 border;
}
.project-group-icon {
    @apply mx-1;
}
.tree-panel-header {
    margin-bottom: 2rem;
    line-height: 120%;
    .title {
        @apply text-2xl;
        margin-right: 1rem;
    }
}

.body-container {
    @apply w-full;
    & > :first-child {
        margin-bottom: 0.625rem;
    }
    .radio-row {
        .radio-text {
            margin-left: 0.40625rem;
        }
    }
    .search-radio {
        margin-left: 1.6rem;
        .project-search-dropdown {
            margin-top: 0.3125rem;
            max-width: 23.5rem;
        }
    }
}
</style>
