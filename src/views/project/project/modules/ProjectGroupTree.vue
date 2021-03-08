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
                                       @click="openProjectGroupCreateForm()"
                        />
                    </template>
                </div>
            </template>
        </sidebar-title>
        <div class="mx-3">
            <p-tree :data-fetcher="() => allProjectNode"
                    :toggle-options="{disabled: true}"
                    :edit-options="{disabled: true}"
                    :drag-options="{disabled: true}"
                    @init="onAllProjectTreeInit"
                    @change-select="onAllProjectChangeSelect"
            >
                <template #left-extra>
                    <p-i name="ic_tree_all-projects" width="1rem" height="1rem"
                         class="all-project-button" color="inherit"
                    />
                </template>
            </p-tree>

            <p-tree :edit-options="editOptions"
                    :drag-options="dragOptions"
                    :toggle-options="toggleOptions"
                    :data-setter="dataSetter"
                    :data-getter="dataGetter"
                    :data-fetcher="dataFetcher"
                    :get-class-names="getClassNames"
                    :fetch-on-init="false"
                    @init="onTreeInit"
                    @finish-edit="onFinishEdit"
                    @update-drag="onUpdateDrag"
                    @change-select="onChangeSelect"
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
                <template #right-extra="{node, path}">
                    <p-icon-button v-if="treeEditMode && (permissionInfo[node.data.id] || node.data.has_permission)"
                                   name="ic_delete" class="group-delete-btn"
                                   size="sm"
                                   @click.stop="openProjectGroupDeleteCheckModal({node, path})"
                    />
                    <p-icon-button v-if="!treeEditMode" name="ic_plus" class="group-add-btn"
                                   size="sm"
                                   @click.stop="openProjectGroupCreateForm({node, path})"
                    />
                </template>
            </p-tree>
        </div>
    </fragment>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PIconButton, PTree, PButton,
} from '@spaceone/design-system';
import { SpaceConnector } from '@/lib/space-connector';
import {
    ProjectGroupTreeItem,
    ProjectItemResp, ProjectTreeItem, ProjectTreeRootItem,
} from '@/views/project/project/type';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { store } from '@/store';
import SidebarTitle from '@/common/components/sidebar-title/SidebarTitle.vue';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'ProjectGroupTree',
    components: {
        SidebarTitle,
        FavoriteButton,
        PTree,
        PIconButton,
        PI,
        PButton,
    },
    props: {
        initGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            rootNode: computed(() => store.state.projectPage.rootNode),
            permissionInfo: {},
            treeEditMode: computed(() => store.state.projectPage.treeEditMode),
            editOptions: computed(() => ({
                disabled: !state.treeEditMode,
                editStartValidator: item => !!(state.permissionInfo[item.data.id] || item.data.has_permission),
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
                    return !!(state.permissionInfo[node.data.id] || node.data.has_permission);
                },
                dropValidator(node, parent) {
                    if (parent) {
                        return !!(state.permissionInfo[parent.data.id] || parent.data.has_permission);
                    }
                    return !!store.getters['user/isDomainOwner'];
                },
            })),
            allProjectRoot: null as any,
            allProjectNode: computed(() => ([vm.$t('PROJECT.LANDING.ALL_PROJECT')])),
        });

        const toggleOptions = {
            validator: node => node.data.has_child || node.children.length > 0,
        };

        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = node => node.data.name;

        const getClassNames = ({ data }) => ({
            'no-permission': state.treeEditMode
                    && !state.permissionInfo[data.id]
                    && !data.has_permission,
        });

        const openProjectGroupDeleteCheckModal = (item) => {
            store.dispatch('projectPage/openProjectGroupDeleteCheckModal', item);
        };

        const openProjectGroupCreateForm = (item = {}) => {
            store.dispatch('projectPage/openProjectGroupCreateForm', item);
        };

        const startTreeEdit = () => {
            store.commit('projectPage/setTreeEditMode', true);
        };

        const finishTreeEdit = () => {
            store.commit('projectPage/setTreeEditMode', false);
        };

        const getAllCurrentGroupIds = (): string[] => {
            if (!state.rootNode) return [];

            const children = state.rootNode.getAllNodes();
            return children.map(d => d.data.id);
        };

        const permissionApiQueryHelper = new ApiQueryHelper();
        const getPermissionInfo = async (ids: string[]): Promise<object> => {
            const res = {};

            try {
                permissionApiQueryHelper.setOnly('project_group_id')
                    .setFilters([{ k: 'project_group_id', v: ids }]);

                const { results } = await SpaceConnector.client.identity.projectGroup.list({
                    query: permissionApiQueryHelper.data,
                    author_within: true,
                });
                results.forEach((d) => {
                    res[d.project_group_id] = true;
                });
            } catch (e) {
                console.error(e);
            }

            return res;
        };

        const getCurrentNodesPermissionInfo = async () => {
            const ids = getAllCurrentGroupIds();
            state.permissionInfo = await getPermissionInfo(ids);
        };

        watch(() => state.treeEditMode, async (treeEditMode) => {
            if (treeEditMode) {
                await getCurrentNodesPermissionInfo();
            }
        });

        const dataFetcher = async (node): Promise<ProjectItemResp[]> => {
            try {
                const params: any = {
                    exclude_type: 'PROJECT',
                    sort: { key: 'name', desc: false },
                    item_type: 'ROOT',
                    check_child: true,
                };

                if (node.data?.id && node.data?.item_type) {
                    params.item_id = node.data.id;
                    params.item_type = node.data.item_type;
                }

                if (state.treeEditMode) {
                    params.include_permission = true;
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);

                if (!node.data) {
                    store.commit('projectPage/setHasProjectGroup', Array.isArray(items) ? !!items.length : false);
                }

                return items;
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const onFinishEdit = async (item: ProjectTreeItem) => {
            try {
                const params = {
                    project_group_id: item.data.id,
                    name: item.data.name,
                };

                await SpaceConnector.client.identity.projectGroup.update(params);
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'), e, vm.$root);
            }
        };

        const onUpdateDrag = async (node, parent) => {
            try {
                const params: any = {
                    project_group_id: node.data.id,
                };
                if (parent) {
                    params.parent_project_group_id = parent.data.id;
                } else {
                    // eslint-disable-next-line camelcase
                    params.release_parent_project_group = true;
                }

                await SpaceConnector.client.identity.projectGroup.update(params);
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'), e, vm.$root);
            }
        };

        const onChangeSelect = (node, path) => {
            store.commit('projectPage/setSelectedItem', node ? { node, path } : {});
        };

        const onAllProjectChangeSelect = (node) => {
            if (node && store.getters['projectPage/groupId'] && state.rootNode) {
                state.rootNode.resetSelect();
            }
        };

        watch(() => store.getters['projectPage/groupId'], (data) => {
            if (!state.allProjectRoot) return;
            if (data) {
                state.allProjectRoot.resetSelect();
            } else {
                state.allProjectRoot.changeSelectState(state.allProjectNode, [0]);
            }
        });


        /* Init */

        const onTreeInit = async (root) => {
            await store.dispatch('projectPage/initRoot', root);
        };

        const onAllProjectTreeInit = async (root) => {
            state.allProjectRoot = root;
        };

        watch([() => state.rootNode, () => state.allProjectRoot], async ([rootNode, allProjectRoot]) => {
            if (rootNode && allProjectRoot) {
                if (store.state.projectPage.isInitiated) return;

                if (props.initGroupId) {
                    const res = await store.dispatch('projectPage/selectNode', props.initGroupId);
                    if (!res) {
                        allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                        await rootNode.fetchData();
                    }
                } else {
                    allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                    await rootNode.fetchData();
                }
                store.commit('projectPage/setIsInitiated', true);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            toggleOptions,
            dataSetter,
            dataGetter,
            getClassNames,
            openProjectGroupDeleteCheckModal,
            openProjectGroupCreateForm,
            startTreeEdit,
            finishTreeEdit,
            dataFetcher,
            onFinishEdit,
            onUpdateDrag,
            onChangeSelect,
            onTreeInit,
            onAllProjectTreeInit,
            onAllProjectChangeSelect,
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
.group-add-btn, .group-delete-btn {
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
    .tree-node-back {
        &:not(:hover) .group-add-btn {
            display: none;
        }
        .node.no-permission {
            > .data, > .icon {
                @apply text-gray-400;
                cursor: not-allowed;
            }
        }
    }
}
</style>
