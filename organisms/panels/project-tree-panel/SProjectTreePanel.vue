<template>
    <p-pane-layout class="panel">
        <slot name="top">
            <div class="title">
                Project
            </div>
        </slot>
        <div class="flex my-4">
            <p-icon-text-button style-type="primary" name="ic_plus_bold" outline
                                @click="goToProject"
            >
                {{ $t('BTN.CREATE_PROJECT') }}
            </p-icon-text-button>
        </div>
        <div class="toolbox">
            <span v-if="!hasProject" class="msg">
                {{ $t('ACTION.PROJECT.NO_PROJECT') }}
            </span>
            <div v-else-if="!release&&error" class="alert">
                <span class="alert-msg">
                    <p-i name="ic_alert" width="1rem" height="1rem" />
                </span>
                <span>   {{ $t('ACTION.PROJECT.SELECT_PROJECT_OR_RELEASE') }}</span>
            </div>
            <i18n v-else-if="targetName&&selectProjectName"
                  path="ACTION.PROJECT.ITEM_WILL_SELECT_FOR"
                  tag="span"
                  class="align-baseline"
            >
                <template #item>
                    <span class="font-bold">[{{ targetName }}]</span>
                </template>
                <template #project>
                    <span class="font-bold text-blue">[{{ selectProjectName }}]</span>
                </template>
            </i18n>
            <span v-else class="msg">
                {{ $t('ACTION.PROJECT.SELECT_PROJECT_FOR',{resource:resourceName}) }}
            </span>
            <p-icon-button
                name="ic_refresh"
                @click="refreshProject"
            />
        </div>
        <transition name="fade">
            <div v-if="hasProject">
                <p-tree ref="treeRef"
                        class="tree tree-box"
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
            </div>
            <div v-else-if="isLoading">
                <PSkeleton class="tree-box" />
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

import PTree from '@/components/molecules/tree-origin/Tree.vue';
import { fluentApi } from '@/lib/fluent-api';
import { ProjectNode, ProjectTreeFluentAPI } from '@/lib/api/tree';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import { useStore } from '@/store/toolset';
import { PROJECT_MAIN_PAGE_NAME } from '@/routes/project/project-route';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';

import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';

export default {
    name: 'SProjectTreePanel',
    components: {
        PTree, PCheckBox, PI, PPaneLayout, PSkeleton, PIconButton, PIconTextButton,
    },
    events: ['change'],
    props: {
        resourceName: {
            type: String,
            default: '',
        },
        targetName: {
            type: String,
            default: '',
        },
    },
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
            state.release = false;
            if (aft !== bef) {
                if (aft && aft !== bef && aft.data.item_type !== 'PROJECT') {
                    state.error = true;
                } else {
                    state.error = false;
                }
            }
        });

        const refreshProject = async () => {
            state.isLoading = true;
            state.hasProject = false;
            const resp = await fluentApi.identity().project().list().setCountOnly()
                .execute();
            if (resp.data.total_count) {
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
        const selectProjectName = computed(() => {
            if (treeAPITS.ts.metaState.firstSelectedNode) {
                return treeAPITS.ts.metaState.firstSelectedNode.data.name;
            }
            return '';
        });

        return {
            treeAPITS,
            treeRef: treeAPITS.ts.treeRef,
            ...toRefs(state),
            update: (event) => {
                treeAPITS.ts.getSelectedNode(event);
            },
            refreshProject,
            goToProject,
            selectProjectName,

        };
    },

};
</script>

<style lang="postcss" scoped>
    .tree-box{
        @apply w-full min-h-56 max-h-56 rounded-b-sm;
    @screen lg{
        @apply w-1/2;
    }
    }
    .toolbox{
        @apply flex justify-between mb-2 mt-5 align-middle items-center;
    .msg{
        @apply align-middle font-bold;
    }
    }
    .tree{
        @apply  overflow-auto border-gray-200  border;

    }
    .title{
        @apply text-2xl mb-8;
        line-height: 120%;
    }
    .alert{
        @apply text-alert align-middle;
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
