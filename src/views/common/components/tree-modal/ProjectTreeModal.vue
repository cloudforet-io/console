<template>
    <p-button-modal :header-title="$t('COMMON.TREE_MODAL.TITLE')"
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
                {{ $t('COMMON.TREE_MODAL.SELECT_PROJECT') }}
            </div>
            <div class="body-container">
                <p-tree ref="treeRef" class="tree-container"
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
                </p-tree>
                <div class="no-select">
                    <p-radio class="mr-2"
                             :selected="!firstSelectedNode"
                             :value="true" @click="releaseProject"
                    /><span class="cursor-pointer" @click="releaseProject">{{ $t('COMMON.TREE_MODAL.SELECT_NO_PROJECT') }}</span>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/components/util/composition-helpers';
import PI from '@/components/atoms/icons/PI.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { TreeItem, TreeNode } from '@/components/molecules/tree-node/type';
import { ProjectItemResp } from '@/views/project/project/type';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PTree from '@/components/organisms/tree/PTree.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { TreeSearchResp } from '@/lib/fluent-api/identity/project';
import { findIndex } from 'lodash';

function getTreeItem<T=ProjectItemResp>(
    key: number, level: number, node: TreeNode<T>, parent: TreeItem<T>|null = null,
): TreeItem<T> {
    return {
        key,
        level,
        node,
        parent,
    };
}
const getParam = (id?: string, type?: string) => {
    const param: any = {
        sort: { key: 'name', desc: false },
        item_type: 'ROOT',
    };
    if (id && type) {
        param.item_id = id;
        param.item_type = type;
    }
    return param;
};

const toNodes = (resp): TreeNode[]|boolean => {
    if (resp.items.length === 0) {
        return false;
    }
    return resp.items.map(d => ({
        data: d,
        children: d.has_child,
        state: {
            expanded: false,
            selected: false,
            loading: false,
        },
    }));
};

interface Props {
    visible: boolean;
    projectId: string;
    loading: boolean;
}

export default {
    name: 'ProjectTreeModal',
    components: {
        PTree,
        PRadio,
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
    setup(props: Props, { emit }) {
        const state = reactive({
            treeRef: null as null|any,
            proxyVisible: makeProxy('visible', props, emit),
            firstSelectedNode: computed<TreeItem|null>(() => (state.treeRef ? state.treeRef.firstSelectedNode : null)),
        });

        const getSearchPath = async (id: string, type: string): Promise<TreeSearchResp> => {
            const res = await SpaceConnector.client.identity.project.tree.search({
                item_id: id,
                item_type: type,
            });
            return res;
        };

        const requestTreeSearchData = async (id?: string, type?: string): Promise<TreeNode[]|boolean> => {
            try {
                const res = await SpaceConnector.client.identity.project.tree(getParam(id, type));
                return toNodes(res);
            } catch (e) {
                console.error(e);
                return false;
            }
        };

        const requestTreeData = async (node?: TreeNode): Promise<TreeNode[]|boolean> => {
            try {
                const res = await SpaceConnector.client.identity.project.tree(getParam(node?.data.id, node?.data.item_type));
                return toNodes(res);
            } catch (e) {
                console.error(e);
                return false;
            }
        };

        const getRecursiveData = async (ids: string[], idx = 0, parent?: TreeItem): Promise<TreeNode[]|boolean> => {
            if (parent) {
                // Leaf case - end
                if (idx === ids.length - 1) {
                    parent.node.state.selected = true;
                    state.treeRef.selectedNodes = [parent];
                    return parent.node.children;
                }

                let children = await requestTreeSearchData(ids[idx], parent.node.data.item_type);
                if (Array.isArray(children)) {
                    children = children.map(d => reactive(d)) as TreeNode[];
                    const key = findIndex(children, d => d.data.id === ids[idx + 1]);
                    if (key !== -1) {
                        const nextParent = getTreeItem(key, idx + 1, children[key], parent);
                        nextParent.node.children = await getRecursiveData(ids, idx + 1, nextParent);
                        nextParent.node.state.expanded = (idx < ids.length - 2);
                    }
                }
                return children;
            }

            // Root case - start
            let rootItems = await requestTreeSearchData(undefined, 'ROOT') as TreeNode[];
            rootItems = rootItems.map(d => reactive(d)) as TreeNode[];
            const itemIdx = findIndex(rootItems, d => d.data.id === ids[idx]);
            if (itemIdx !== -1) {
                const item = getTreeItem(itemIdx, 0, rootItems[itemIdx]);
                item.node.children = await getRecursiveData(ids, idx, item);
                item.node.state.expanded = (idx !== ids.length - 1);
            }
            return rootItems;
        };

        const findNode = async (id: string) => {
            const res = await getSearchPath(id, 'PROJECT');
            state.treeRef.nodes = await getRecursiveData(res.open_path) as TreeNode[];
        };

        const getData = async (item?: TreeItem): Promise<void> => {
            if (item) {
                item.node.state.expanded = true;
                item.node.state.loading = true;
                state.treeRef.applyState(item);

                item.node.children = await requestTreeData(item.node);

                item.node.state.loading = false;
                state.treeRef.applyState(item);
            } else {
                const res = await requestTreeData();
                state.treeRef.nodes = Array.isArray(res) ? res : [];
            }
        };

        watch([() => props.visible, () => state.treeRef], async ([visible, treeRef]) => {
            if (visible && treeRef) {
                if (props.projectId) {
                    await findNode(props.projectId);
                } else {
                    await getData();
                }
            } else if (!visible && treeRef) {
                treeRef.nodes = [];
                treeRef.selectedNodes = [];
            }
        }, { immediate: true });


        const autoScroll = (el: HTMLElement) => {
            if (state.treeRef?.$el) {
                const offsetBottom = el.offsetTop + el.offsetHeight;
                const scrollBottom = state.treeRef.$el.scrollTop + state.treeRef.$el.offsetHeight;
                if (offsetBottom > scrollBottom) {
                    state.treeRef.$el.scrollTop = offsetBottom - state.treeRef.$el.offsetHeight;
                }
            }
        };

        const resetSelectedNode = (item: TreeItem<ProjectItemResp>, compare?: TreeItem<ProjectItemResp>) => {
            if (compare) {
                if (compare.node.data.id === item.node.data.id) {
                    state.treeRef.selectedNodes = [];
                } else if (compare.parent) resetSelectedNode(item, compare.parent);
            } else {
                if (!state.firstSelectedNode) return;
                if (!state.firstSelectedNode.parent) return;
                if (state.firstSelectedNode.level <= item.level) return;
                resetSelectedNode(item, state.firstSelectedNode.parent);
            }
        };

        const onNodeMounted = (item: TreeItem) => {
            if (state.firstSelectedNode?.node.data.id === item.node.data.id && item.el) {
                autoScroll(item.el);
            }
        };

        const releaseProject = () => {
            if (state.firstSelectedNode) {
                state.treeRef.setNodeState(state.firstSelectedNode, { selected: false });
                state.treeRef.selectedNodes = [];
            }
        };

        const selectItem = (item: TreeItem<ProjectItemResp>) => {
            if (item.node.data.item_type === 'PROJECT') {
                if (!item.node.state.selected) state.treeRef.setSelectedNodes(item);
            }
        };

        const toggle = async (item: TreeItem<ProjectItemResp>, matched: TreeItem<ProjectItemResp>[], e: MouseEvent) => {
            e.stopPropagation();
            if (item.node.state.expanded) {
                resetSelectedNode(item);
                item.node.state.expanded = false;
                state.treeRef.applyState(item);
                item.node.children = !!item.node.children;
                return;
            }

            await getData(item);
        };

        const confirm = () => {
            if (state.firstSelectedNode) {
                emit('confirm', state.firstSelectedNode.node.data);
            } else {
                emit('confirm', null);
            }
        };

        return {
            ...toRefs(state),
            toggle,
            selectItem,
            confirm,
            releaseProject,
            onNodeMounted,
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
