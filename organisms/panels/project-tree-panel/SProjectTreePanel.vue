<template>
    <p-pane-layout class="panel">
        <slot name="top">
            <div class="title">
                Project
            </div>
        </slot>
        <div class="flex my-4">
            <p-button style-type="primary" outline @click="goToProject">
                {{ $t('BTN.CREATE_PROJECT') }}
            </p-button>
            <p-button class="ml-2" style-type="primary" outline
                      @click="refreshProject"
            >
                {{ $t('BTN.REFRESH') }}
            </p-button>
        </div>
        <transition name="fade">
            <div v-if="hasProject">
                <p-tree ref="treeRef"
                        class="tree"

                        v-bind="treeAPITS.ts.state"
                        @node:selected="update"
                        @node:unselected="update"
                >
                    <template #icon="{node,isExpanded}">
                        <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' :
                                 isExpanded ? 'ic_tree_folder--opened' : 'ic_tree_folder'"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
                    </template>
                </p-tree>
                <div class="mt-2">
                    <span @click.stop.capture="release= !release"><p-check-box v-model="release" /> release project</span>
                </div>
                <div v-show="!release&&error" class="alert">
                    <span class="alert-msg">
                        <p-i name="ic_alert" width="1rem" height="1rem" />
                    </span>
                    <span>   Please select a project or release the project</span>
                </div>
            </div>
            <div v-else-if="isLoading">
                <PSkeleton height="14rem" width="50%" />
            </div>
            <div v-else>
                No data
            </div>
        </transition>
        <slot name="bottom" />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import PI from '@/components/atoms/icons/PI.vue';

import PTree from '@/components/molecules/tree-new/Tree.vue';
import { fluentApi } from '@/lib/fluent-api';
import { ProjectNode, ProjectTreeFluentAPI } from '@/lib/api/tree';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import { useStore } from '@/store/toolset';
import PButton from '@/components/atoms/buttons/Button.vue';
import { PROJECT_MAIN_PAGE_NAME } from '@/routes/project/project-route';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';

export default {
    name: 'SProjectTreePanel',
    components: {
        PTree, PCheckBox, PI, PPaneLayout, PButton, PSkeleton,
    },
    events: ['change'],
    setup(props, context) {
        const vm = getCurrentInstance();
        const treeAPITS = new ProjectTreeFluentAPI(fluentApi.identity().project().tree());
        const state = reactive({
            release: true,
            error: false,
            selectNode: computed(() => (treeAPITS.ts.metaState.firstSelectedNode as unknown as null|ProjectNode)),
            hasProject: true,
            isLoading: false,
        });


        watch(() => state.selectNode, (aft, bef) => {
            console.debug(state.selectNode, aft, 'select-node');
            state.release = false;
            if (aft !== bef) {
                if (aft && aft !== bef && aft.data.item_type !== 'PROJECT') {
                    state.error = true;
                } else {
                    state.error = false;
                }
            }
        });
        const { project } = useStore();

        const refreshProject = async () => {
            state.isLoading = true;
            state.hasProject = false;
            await project.getProject(true);
            console.debug(project.state);
            if (Object.keys(project.state.projects).length > 1) {
                state.hasProject = true;
            }
            state.isLoading = false;
        };
        onMounted(async () => {
            await refreshProject();
        });

        const projectPath = vm?.$router.resolve({ name: PROJECT_MAIN_PAGE_NAME }).href;
        const goToProject = () => {
            window.open(projectPath);
        };
        return {
            treeAPITS,
            treeRef: treeAPITS.ts.treeRef,
            ...toRefs(state),
            update: (event) => {
                treeAPITS.ts.getSelectedNode(event);
            },
            refreshProject,
            goToProject,

        };
    },

};
</script>

<style lang="postcss" scoped>
    .tree{
        @apply min-h-56 max-h-56 overflow-auto border-gray-200 rounded-b-sm border;
        @screen lg{
            @apply w-1/2;
        }
    }
    .title{
        @apply text-2xl mb-8;
        line-height: 120%;
    }
    .alert{
        @apply text-alert mt-4 align-middle;
        .alert-msg{
            @apply align-middle;
        }
    }
    .fade-in-enter-active {
        transition: opacity 0.5s, visibility 0.5s;
    }
    .fade-in-leave-active {
        transition: opacity 0.5s, visibility 0.5s;
    }
    .fade-in-enter, &.fade-in-leave-to {
        visibility: hidden;
        opacity: 0;
    }
    .fade-in-leave, &.fade-in-enter-to {
        visibility: visible;
        opacity: 1;
    }
</style>
