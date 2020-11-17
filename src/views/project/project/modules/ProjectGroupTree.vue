<template>
    <div>
        <p-tree-node :data="$t('PROJECT.LANDING.ALL_PROJECT')" :state.sync="treeAllState"
                     disable-toggle
                     @row:click="resetSelectedNodes"
        >
            <template #left-extra>
                <p-i name="ic_tree_all-projects" width="1rem" height="1rem"
                     class="all-project-button" color="inherit"
                />
            </template>
        </p-tree-node>

        <p-tree ref="treeRef"
                @toggle:click="toggle"
                @node:click="onNodeClick"
                @row:mouseenter="onHoverItem(...arguments, true)"
                @row:mouseleave="onHoverItem(...arguments, false)"
        >
            <template #data="{data}">
                {{ data.name }}
            </template>
            <template #toggle="{state, toggleSize}">
                <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                     :height="toggleSize"
                />
            </template>
            <template #toggle-right="{data}">
                <favorite-button :item-id="data.id"
                                 favorite-type="projectGroup"
                                 resource-type="identity.Project"
                                 scale="0.75"
                                 read-only
                />
            </template>
            <template #icon>
                <p-i name="ic_tree_project-group" class="project-group-icon"
                     width="1rem" height="1rem" color="inherit transparent"
                />
            </template>
            <template #right-extra="{data}">
                <div v-if="hoveredNode && data.id === hoveredNode.node.data.id">
                    <p-icon-button :name="'ic_plus'" class="group-add-btn"
                                   width="1rem" height="1rem"
                                   @click.stop="$emit('create', hoveredNode)"
                    />
                </div>
            </template>
        </p-tree>
    </div>
</template>

<script lang="ts">

import PTreeNode from '@/components/molecules/tree-node/PTreeNode.vue';
import PI from '@/components/atoms/icons/PI.vue';
import {
    TreeItem, TreeNode,
} from '@/components/molecules/tree-node/type';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PTree from '@/components/organisms/tree/PTree.vue';
import { Tree } from '@/components/organisms/tree/type';
import { getTreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { findIndex, reverse } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import {
    ProjectGroup, ProjectItemResp, ProjectState, ProjectTreeItem,
} from '@/views/project/project/type';
import FavoriteButton from '@/views/common/components/favorites/FavoriteButton.vue';

interface TreeSearchResp {
    // eslint-disable-next-line camelcase
    open_path: string[];
}

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
    projectState: ProjectState;
}

const getParentGroup = (item: ProjectTreeItem, res: ProjectGroup[] = []): ProjectGroup[] => {
    if (item) {
        res.push(item.node.data);
        if (item.parent) return getParentGroup(item.parent, res);
        return res;
    }
    return res;
};

export default {
    name: 'ProjectGroupTree',
    components: {
        FavoriteButton,
        PTree,
        PIconButton,
        PI,
        PTreeNode,
    },
    props: {
        projectState: {
            type: Object,
            required: true,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            treeRef: null as unknown as Tree,
            firstSelectedNode: computed<TreeItem|null>(() => (state.treeRef ? state.treeRef.firstSelectedNode : null)),
            treeAllState: computed(() => ({
                selected: !state.firstSelectedNode,
                expanded: false,
            })),
            hoveredNode: (null as (ProjectTreeItem|null)),
        });


        const emitSelect = (item: TreeItem|null) => {
            let parents = [] as ProjectGroup[];
            if (item && item.parent) parents = reverse(getParentGroup(item.parent));
            emit('select', item?.node.data.id, item?.node.data.name, parents);
        };

        watch(() => state.firstSelectedNode, (after, before) => {
            if ((after && !before) || (after && after.node.data.id !== before?.node.data.id)) {
                emitSelect(after);
            } else if (!after && before) {
                emitSelect(null);
            }
        }, { immediate: true });

        const onNodeClick = (item: ProjectTreeItem) => {
            if (state.treeRef.firstSelectedNode) {
                if (state.treeRef.firstSelectedNode.node.data.id !== item.node.data.id) {
                    state.treeRef.setNodeState(state.treeRef.firstSelectedNode, { selected: false });
                }
            }
            state.treeRef.setNodeState(item, { selected: true });
            state.treeRef.selectedNodes = [item];
        };

        const resetSelectedNodes = () => {
            if (state.treeRef.firstSelectedNode) {
                state.treeRef.firstSelectedNode.node.state.selected = false;
                state.treeRef.applyState(state.treeRef.firstSelectedNode);
                state.treeRef.selectedNodes = [];
            }
        };

        const onHoverItem = (item: ProjectTreeItem, matched, e, isHovered: boolean) => {
            state.hoveredNode = isHovered ? item : null;
        };

        const deleteSelectedNode = () => {
            if (!state.treeRef) return;
            state.treeRef.deleteNode(state.treeRef.firstSelectedNode);
            state.treeRef.selectedNodes = [];
        };

        const updateSelectedNode = (item: ProjectGroup) => {
            if (!state.firstSelectedNode) return;
            state.firstSelectedNode.node.data = {
                ...state.firstSelectedNode.node.data,
                name: item.name,
            };
        };

        const addNode = async (item: ProjectItemResp, parentNode: null|ProjectTreeItem) => {
            const newNode = {
                data: item,
                children: item.has_child,
                state: { expanded: false, selected: false, loading: false },
            };

            // add to root
            if (parentNode === null) state.treeRef.nodes.push(newNode);
            else if (Array.isArray(parentNode.node.children)) {
                parentNode.node.children.push(newNode);
                state.treeRef.setNodeState(parentNode, { expanded: true });
            } else {
                // eslint-disable-next-line no-use-before-define,@typescript-eslint/no-use-before-define
                await getData(parentNode);
                state.treeRef.setNodeState(parentNode, { expanded: true });
            }
        };

        const getSearchPath = async (id: string, type: string): Promise<TreeSearchResp> => {
            const res = await SpaceConnector.client.identity.project.tree.search({
                item_id: id,
                item_type: type,
            });
            return res;
        };

        const getParam = (id?: string, type?: string) => {
            const param: any = {
                exclude_type: 'PROJECT',
                sort: { key: 'name', desc: false },
                item_type: 'ROOT',
            };
            if (id && type) {
                param.item_id = id;
                param.item_type = type;
            }
            return param;
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
            const res = await getSearchPath(id, 'PROJECT_GROUP');
            state.treeRef.nodes = await getRecursiveData(res.open_path) as TreeNode[];
            if (state.treeRef.nodes.length === 0) emit('empty');
        };

        const resetSelectedNode = (item: TreeItem, compare?: TreeItem) => {
            if (compare) {
                if (compare.node.data.id === item.node.data.id) {
                    state.treeRef.selectedNodes = [item];
                    item.node.state.selected = true;
                } else if (compare.parent) resetSelectedNode(item, compare.parent);
            } else {
                if (!state.treeRef.firstSelectedNode) return;
                if (!state.treeRef.firstSelectedNode.parent) return;
                if (state.treeRef.firstSelectedNode.level <= item.level) return;
                resetSelectedNode(item, state.treeRef.firstSelectedNode.parent);
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
                if (state.treeRef.nodes.length === 0) emit('empty');
            }
        };

        const toggle = async (item: TreeItem, matched: TreeItem[], e: MouseEvent) => {
            e.stopPropagation();
            if (item.node.state.expanded) {
                resetSelectedNode(item);
                item.node.state.expanded = false;
                if (state.treeRef) state.treeRef.applyState(item);
                item.node.children = !!item.node.children;
                return;
            }

            await getData(item);
        };

        const listNodes = async () => {
            resetSelectedNodes();
            await getData();
        };

        onMounted(() => {
            vm.$nextTick(() => {
                emit('mounted');
            });
        });


        return {
            ...toRefs(state),
            onNodeClick,
            resetSelectedNodes,
            onHoverItem,
            deleteSelectedNode,
            updateSelectedNode,
            addNode,
            findNode,
            listNodes,
            toggle,
        };
    },
};
</script>

<style lang="postcss" scoped>
::v-deep .basic {
    @apply mx-3 mt-1;
}
.all-project-button {
    @apply mr-1;
}
.project-group-icon {
    @apply mx-1;
}
.group-add-btn {
    @apply float-right mr-1;
    max-width: 1.5rem;
    max-height: 1.5rem;
    min-width: 1.5rem;
    min-height: 1.5rem;
    &:hover {
        @apply bg-blue-300 border-blue-300;
        color: inherit;
    }
}
</style>
