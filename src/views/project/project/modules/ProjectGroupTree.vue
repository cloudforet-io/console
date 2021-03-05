<template>
    <fragment>
        <sidebar-title :title="$t('PROJECT.LANDING.PROJECT_GROUPS')">
            <template #extra>
                <div class="action-btn-wrapper">
                    <p-button v-if="treeEditMode" size="sm" style-type="secondary"
                              @click="finishTreeEdit"
                    >
                        {{ $t('PROJECT.LANDING.PROJECT_GROUP_TREE.DONE') }}
                    </p-button>
                    <template v-else>
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.EDIT')"
                                       name="ic_edit-text" style-type="transparent" size="sm"
                                       @click="startTreeEdit"
                        />
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.CREATE')"
                                       name="ic_plus_thin" style-type="transparent" size="sm"
                                       color="inherit"
                                       class="ml-1"
                                       @click="openProjectGroupCreateForm"
                        />
                    </template>
                </div>
            </template>
        </sidebar-title>
        <div class="mx-3">
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
    </fragment>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PTreeNode, PI, PIconButton, PTree, PButton,
} from '@spaceone/design-system';
import { SpaceConnector } from '@/lib/space-connector';
import {
    ProjectItemResp, ProjectTreeItem,
} from '@/views/project/project/type';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { store } from '@/store';
import SidebarTitle from '@/common/components/SidebarTitle.vue';

export default {
    name: 'ProjectGroupTree',
    components: {
        SidebarTitle,
        FavoriteButton,
        PTree,
        PIconButton,
        PI,
        PTreeNode,
        PButton,
    },
    props: {
        initGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            selectedNodes: [] as ProjectTreeItem[],
            firstSelectedNode: computed<ProjectTreeItem|undefined>(() => (state.selectedNodes[0])),
            permissionInfo: {},
            treeEditMode: computed(() => store.state.projectPage.treeEditMode),
            selectOptions: {
            },
            editOptions: computed(() => ({
                disabled: !state.treeEditMode,
                editStartValidator: item => !!state.permissionInfo[item.data.id],
                validator: text => (text && text.length > 2 && text.length < 40),
                dataSetter(text, originData) {
                    return {
                        ...originData,
                        name: text,
                    };
                },
                dataGetter(data) {
                    return data.name;
                },
            })),
            dragOptions: computed(() => ({
                disabled: !state.treeEditMode,
                dragValidator(node) {
                    return !!state.permissionInfo[node.data.id];
                },
                dropValidator(node) {
                    return !!state.permissionInfo[node.data.id];
                },
            })),
            isAllProjectSelected: computed(() => store.state.projectPage.rootNode && !state.firstSelectedNode),
        });

        const openProjectGroupCreateForm = () => {
            store.dispatch('projectPage/openProjectGroupCreateForm', null);
        };

        const startTreeEdit = () => {
            store.commit('projectPage/setTreeEditMode', true);
        };

        const finishTreeEdit = () => {
            store.commit('projectPage/setTreeEditMode', false);
        };

        const selectAllProjectNode = () => {
            if (state.firstSelectedNode) {
                state.firstSelectedNode.setSelected(false);
            }
        };

        const getPermissionInfo = async () => {

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


        const onTreeInit = async (root) => {
            await store.dispatch('projectPage/initRoot', root);

            if (props.initGroupId) {
                await store.dispatch('projectPage/selectNode', props.initGroupId);
            }

            watch(() => state.firstSelectedNode, (after) => {
                store.commit('projectPage/setSelectedNode', after);
            }, { immediate: true });
        };

        return {
            ...toRefs(state),
            openProjectGroupCreateForm,
            startTreeEdit,
            finishTreeEdit,
            selectAllProjectNode,
            dataFetcher,
            onTreeInit,
        };
    },
};
</script>

<style lang="postcss" scoped>
.action-btn-wrapper {
    @apply ml-auto justify-end mr-3 inline-flex items-center;
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
