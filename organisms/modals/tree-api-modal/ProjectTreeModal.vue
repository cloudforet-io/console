<template>
    <p-button-modal header-title="Change Project"
                    size="md"
                    :scrollable="false"
                    centered
                    fade
                    backdrop
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    @confirm="confirm"
    >
        <template #body>
            <div class="title">
                Select a Project
            </div>
            <div class="body-container">
                <div ref="treeContainer" class="tree-container">
                    <p-tree-node v-for="(node, idx) in treeApiHandler.ts.metaState.nodes" :key="idx"
                                 v-bind="treeApiHandler.ts.state"
                                 :data.sync="node.data"
                                 :children.sync="node.children"
                                 :state.sync="node.state"
                                 @toggle:click="toggle"
                                 @node:click="selectItem"
                                 @checkbox:click="selectItem"
                                 @mounted="onNodeMounted"
                    >
                        <template #data="{data}">
                            <span :class="{
                                'ml-2': data.item_type === 'PROJECT'
                            }"
                            >{{ data.name }}</span>
                        </template>
                        <template #toggle="{state, toggleSize, data, getListeners}">
                            <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                                 :height="toggleSize"
                            />
                            <p-radio v-else-if="data.item_type === 'PROJECT'"
                                     :selected="state.selected" :value="true" v-on="getListeners('checkbox')"
                            />
                        </template>
                        <template #toggle-right="{data}">
                            <p-i v-if="data.item_type === 'PROJECT_GROUP'" name="ic_tree_project-group" class="project-group-icon"
                                 width="1rem" height="1rem" color="inherit transparent"
                            />
                        </template>
                    </p-tree-node>
                </div>
                <div class="no-select">
                    <p-radio class="mr-2"
                             :selected="!treeApiHandler.ts.metaState.firstSelectedNode"
                             :value="true" @click="releaseProject"
                    /><span class="cursor-pointer" @click="releaseProject">Select no Project</span>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, onMounted, Ref, ref, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import PI from '@/components/atoms/icons/PI.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { ProjectNodeState, ProjectTreeFluentAPI } from '@/lib/api/tree-node';
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { fluentApi } from '@/lib/fluent-api';
import { TreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';

export default {
    name: 'SProjectTreeModal',
    components: {
        PRadio,
        PTreeNode,
        PI,
        PButtonModal,
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setup(props, { emit }) {
        const projectApi = fluentApi.identity().project();

        const treeApiHandler = new ProjectTreeFluentAPI({
            treeAction: projectApi.tree().setSortBy('name').setSortDesc(false),
            treeSearchAction: projectApi.treeSearch(),
        });

        const treeContainer: Ref<HTMLElement|null> = ref(null);

        // const isRelease = ref(true);


        watch(() => props.visible, async (after, before) => {
            if (after === before) return;
            if (after) {
                if (props.projectId) {
                    await treeApiHandler.getSearchData(props.projectId);
                } else {
                    await treeApiHandler.getData();
                }
            } else {
                treeApiHandler.ts.metaState.nodes = [];
                treeApiHandler.ts.metaState.selectedNodes = [];
            }
        });

        // watch(() => treeApiHandler.ts.metaState.firstSelectedNode, (item) => {
        //     isRelease.value = !!item;
        // });

        const autoScroll = (el: HTMLElement) => {
            if (treeContainer.value) {
                const offsetBottom = el.offsetTop + el.offsetHeight;
                const scrollBottom = treeContainer.value.scrollTop + treeContainer.value.offsetHeight;
                if (offsetBottom > scrollBottom) {
                    treeContainer.value.scrollTop = offsetBottom - treeContainer.value.offsetHeight;
                }
            }
        };

        const resetSelectedNode = (item: TreeItem<ProjectItemResp, ProjectNodeState>, compare?: TreeItem<ProjectItemResp, ProjectNodeState>) => {
            if (compare) {
                if (compare.node.data.id === item.node.data.id) {
                    treeApiHandler.ts.metaState.selectedNodes = [];
                } else if (compare.parent) resetSelectedNode(item, compare.parent);
            } else {
                if (!treeApiHandler.ts.metaState.firstSelectedNode) return;
                if (!treeApiHandler.ts.metaState.firstSelectedNode.parent) return;
                if (treeApiHandler.ts.metaState.firstSelectedNode.level <= item.level) return;
                resetSelectedNode(item, treeApiHandler.ts.metaState.firstSelectedNode.parent);
            }
        };


        return {
            treeContainer,
            proxyVisible: makeProxy('visible'),
            treeApiHandler,
            async toggle(item: TreeItem<ProjectItemResp, ProjectNodeState>, matched: TreeItem<ProjectItemResp, ProjectNodeState>[], e: MouseEvent): Promise<void> {
                e.stopPropagation();
                if (item.node.state.expanded) {
                    resetSelectedNode(item);
                    item.node.state.expanded = false;
                    treeApiHandler.ts.applyState(item);
                    item.node.children = !!item.node.children;
                    return;
                }

                await treeApiHandler.getData(item);
            },
            selectItem(item: TreeItem<ProjectItemResp, ProjectNodeState>): void {
                if (item.node.data.item_type === 'PROJECT') {
                    if (!item.node.state.selected) treeApiHandler.ts.setSelectedNodes(item);
                }
            },
            confirm(): void {
                if (treeApiHandler.ts.metaState.firstSelectedNode) {
                    emit('confirm', treeApiHandler.ts.metaState.firstSelectedNode.node.data);
                } else {
                    emit('confirm', null);
                }
            },
            releaseProject() {
                if (treeApiHandler.ts.metaState.firstSelectedNode) {
                    treeApiHandler.ts.setNodeState(treeApiHandler.ts.metaState.firstSelectedNode, { selected: false });
                    treeApiHandler.ts.metaState.selectedNodes = [];
                }
            },
            onNodeMounted(item: TreeItem) {
                if (treeApiHandler.ts.metaState.firstSelectedNode
                    && treeApiHandler.ts.metaState.firstSelectedNode.node.data.id === item.node.data.id
                    && item.el) {
                    autoScroll(item.el);
                }
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    font-size: 1.375rem;
    line-height: 1.6;
    margin-bottom: 1.2rem;
}
.body-container {
    @apply bg-primary4 border border-gray-200 rounded-sm flex flex-col;
}
.tree-container {
    @apply overflow-auto flex-grow px-2 py-4;
    height: 21.5rem;
    .project-group-icon {
        @apply mx-1;
    }
}

.no-select {
    @apply border-t border-gray-200 p-4 flex items-center;
}
</style>
