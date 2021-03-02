<template>
    <div>
        <p-tree-node key="all"
                     :data="$t('PROJECT.LANDING.ALL_PROJECT')"
                     :selected="isAllProjectSelected"
                     :expanded="false"
                     disable-toggle
                     :level="1"
                     @click-node="selectAllProjectNode"
        >
            <template #left-extra>
                <p-i name="ic_tree_all-projects" width="1rem" height="1rem"
                     class="all-project-button" color="inherit"
                />
            </template>
        </p-tree-node>

        <p-tree id-key="id" children-key="has_child"
                :selected-nodes.sync="selectedNodes"
                :data-fetcher="dataFetcher"
                :select-options="selectOptions"
                :edit-options="editOptions"
                :drag-options="dragOptions"
                @init="onTreeInit"
        >
            <template #data="{node}">
                {{ node.data.name }}
            </template>
            <template #toggle="{node}">
                <p-i v-if="node.loading" name="ic_working"
                     width="1rem" height="1rem"
                />
            </template>
            <template #toggle-right="{node}">
                <favorite-button :item-id="node.data.id"
                                 favorite-type="projectGroup"
                                 resource-type="identity.ProjectGroup"
                                 scale="0.75"
                                 read-only
                />
            </template>
            <template #icon>
                <p-i name="ic_tree_project-group" class="project-group-icon"
                     width="1rem" height="1rem" color="inherit transparent"
                />
            </template>
            <template #right-extra="{node}">
                <p-icon-button name="ic_plus" class="group-add-btn"
                               size="sm"
                               @click.stop="$emit('create', node)"
                />
            </template>
        </p-tree>
    </div>
</template>

<script lang="ts">
/* eslint-disable no-await-in-loop */
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PTreeNode, PI, PIconButton, PTree,
} from '@spaceone/design-system';
import {
    TreeItem,
} from '@spaceone/design-system/dist/src/data-display/tree/tree-node/type';

import { reverse } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import {
    ProjectItemResp, ProjectState, ProjectTreeItem,
} from '@/views/project/project/type';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { getProjectState } from '@/views/project/project/lib/state';


export default {
    name: 'ProjectGroupTree',
    components: {
        FavoriteButton,
        PTree,
        PIconButton,
        PI,
        PTreeNode,
    },
    setup(props, { emit }) {
        const projectState = getProjectState();

        const state = reactive({
            treeRef: null as any,
            root: null as unknown as TreeItem,
            selectedNodes: [] as ProjectTreeItem[],
            firstSelectedNode: computed<ProjectTreeItem|undefined>(() => (state.selectedNodes[0])),
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
            isAllProjectSelected: computed(() => projectState.rootNode?.children && !state.firstSelectedNode),
        });


        const selectAllProjectNode = () => {
            if (state.firstSelectedNode) {
                state.firstSelectedNode.setSelected(false);
            }
        };

        const addNode = (data: ProjectItemResp, parent?: ProjectTreeItem) => {
            if (parent) {
                parent.addChild(data);
            } else if (projectState.rootNode) {
                projectState.rootNode.addChild(data);
            }
        };

        const getSearchPath = async (id: string): Promise<string[]> => {
            const res = await SpaceConnector.client.identity.project.tree.search({
                item_id: id,
                item_type: 'PROJECT_GROUP',
            });
            return res.open_path || [];
        };


        const requestTreeData = async (id?: string, type?: string): Promise<ProjectItemResp[]|boolean> => {
            const params: any = {
                exclude_type: 'PROJECT',
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

        const getRootData = async (): Promise<void> => {
            if (projectState.rootNode) {
                const res = await dataFetcher();
                await projectState.rootNode.setChildren(res);
                emit('list', Array.isArray(res) ? res.length : 0);
            } else {
                emit('list', 0);
            }
        };

        const onTreeInit = async (root) => {
            projectState.rootNode = root;
            emit('init', projectState.rootNode);


            await getRootData();

            watch(() => projectState.groupId, async (after, before) => {
                if (after === before) return;

                if (after) {
                    const paths = await getSearchPath(after);
                    const res = await projectState.rootNode.findNode(after, paths);
                    res.setSelected(true);
                } else {
                    selectAllProjectNode();
                }
            }, { immediate: true });
        };

        return {
            ...toRefs(state),
            selectAllProjectNode,
            addNode,
            dataFetcher,
            onTreeInit,
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
