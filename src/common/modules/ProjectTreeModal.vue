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
                <p-tree class="tree-container"
                        id-key="id" children-key="has_child"
                        :selected-nodes.sync="selectedNodes"
                        :data-fetcher="dataFetcher"
                        :select-options="selectOptions"
                        :edit-options="editOptions"
                        :drag-options="dragOptions"
                        @init="onTreeInit"
                >
                    <template #data="{node}">
                        <span :class="{
                            'ml-2': node.data.item_type === 'PROJECT'
                        }"
                        >{{ node.data.name }}</span>
                    </template>
                    <template #toggle="{node}">
                        <p-i v-if="node.loading" name="ic_working"
                             width="1rem" height="1rem"
                        />
                        <p-radio v-else-if="node.data.item_type === 'PROJECT'"
                                 :selected="node.selected" :value="true" @click.stop="node.setSelected(true)"
                        />
                    </template>
                    <template #toggle-right="{node}">
                        <p-i v-if="node.data.item_type === 'PROJECT_GROUP'" name="ic_tree_project-group" class="project-group-icon"
                             width="1rem" height="1rem" color="inherit transparent"
                        />
                    </template>
                </p-tree>
                <div class="no-select">
                    <p-radio class="mr-2"
                             :selected="!firstSelectedNode"
                             :value="true" @click="resetSelectedNodes"
                    /><span class="cursor-pointer" @click="resetSelectedNodes">{{ $t('COMMON.TREE_MODAL.SELECT_NO_PROJECT') }}</span>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable no-await-in-loop */
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PButtonModal, PRadio, PTree,
} from '@spaceone/design-system';
import { makeProxy } from '@spaceone/design-system/src/util/composition-helpers';
import { TreeItem, TreeNode } from '@spaceone/design-system/dist/src/data-display/tree/tree-node/type';

import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';
import { SpaceConnector } from '@/lib/space-connector';


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
            root: null as TreeItem|null,
            selectedNodes: [] as ProjectTreeItem[],
            firstSelectedNode: computed<ProjectTreeItem|undefined>(() => (state.selectedNodes[0])),
            allProjectNode: null as TreeItem<string>|null,
            selectOptions: {
            },
            editOptions: {
                validator: text => (text && text.length > 2 && text.length < 40),
                invalidText: 'should NOT be shorter than 2 characters',
                validText: '2 ~ 40 characters',
                dataSetter(text, originData) {
                    return {
                        ...originData,
                        name: text,
                    };
                },
            },
            dragOptions: {
                disabled: false,
            },
            proxyVisible: makeProxy('visible', props, emit),
        });

        const getSearchPath = async (id: string, type: string): Promise<string[]> => {
            const res = await SpaceConnector.client.identity.project.tree.search({
                item_id: id,
                item_type: type,
            });
            return res.open_path || [];
        };

        const requestTreeData = async (id?: string, type?: string): Promise<ProjectItemResp[]|boolean> => {
            const params: any = {
                sort: { key: 'name', desc: false },
                item_type: 'ROOT',
            };
            if (id && type) {
                params.item_id = id;
                params.item_type = type;
            }
            try {
                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                console.error(e);
                return false;
            }
        };


        const dataFetcher = async (node?: ProjectTreeItem): Promise<ProjectItemResp[]|boolean> => {
            const res = await requestTreeData(node?.data.id, node?.data.item_type);
            return res;
        };

        const findNode = async (targetId: string) => {
            const paths = await getSearchPath(targetId, 'PROJECT_GROUP');

            let node: ProjectTreeItem = state.root;
            for (let i = 0; i < paths.length; i++) {
                const type = paths.length - 1 === i ? 'PROJECT' : 'PROJECT_GROUP';
                const currentId = paths[i];
                const children = await requestTreeData(currentId, type);
                if (!Array.isArray(children)) return;

                await node.addChildren(children);
                // @ts-ignore
                node = node.findChildNode(currentId);
                if (node) {
                    if (i === paths.length - 1) node.setSelected(true);
                    else node.setExpanded(true);
                }
            }
        };


        const getRootData = async (): Promise<void> => {
            if (state.root) {
                state.selectedNodes = [];
                const res = await dataFetcher(state.root);
                await state.root.setChildren(res);
                emit('list', Array.isArray(res) ? res.length : 0);
            } else emit('list', 0);
        };

        const resetSelectedNodes = () => {
            if (state.firstSelectedNode) {
                state.firstSelectedNode.setSelected(false);
            }
        };

        const autoScroll = (el: HTMLElement) => {
            if (state.treeRef.$el) {
                const offsetBottom = el.offsetTop + el.offsetHeight;
                const scrollBottom = state.treeRef.$el.scrollTop + state.treeRef.$el.offsetHeight;
                if (offsetBottom > scrollBottom) {
                    state.treeRef.$el.scrollTop = offsetBottom - state.treeRef.$el.offsetHeight;
                }
            }
        };

        watch([() => props.visible, () => state.treeRef, () => state.root], async ([visible, treeRef, root]) => {
            if (visible && treeRef && root) {
                if (props.projectId) {
                    await findNode(props.projectId);
                } else {
                    await getRootData();
                    autoScroll(root.el);
                }
            } else if (!visible && root) {
                resetSelectedNodes();
                await root.setChildren(false);
            }
        }, { immediate: true });

        watch(() => state.firstSelectedNode, (node) => {
            emit('select', node);
        });


        const onTreeInit = (root: TreeItem) => {
            state.root = root;
        };

        const confirm = () => {
            if (state.firstSelectedNode) {
                emit('confirm', state.firstSelectedNode.data);
            } else {
                emit('confirm', null);
            }
        };

        return {
            ...toRefs(state),
            dataFetcher,
            resetSelectedNodes,
            confirm,
            onTreeInit,
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

.p-tree::v-deep {
    .p-tree-node .tree-row {
        .right-extra {
            display: none;
        }
        &:hover .node .right-extra {
            display: block;
        }
    }
}
</style>
