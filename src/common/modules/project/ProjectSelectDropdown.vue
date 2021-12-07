<template>
    <div class="project-select-dropdown">
        <p-search-dropdown :loading="loading"
                           :visible-menu.sync="visibleMenu"
                           :is-focused.sync="isFocused"
                           :type="multiSelectable ? 'checkbox' : 'radioButton'"
                           show-tag-box
                           :exact-mode="false"
                           use-fixed-menu-style
                           :invalid="invalid"
                           :disabled="readonly"
                           :placeholder="$t('COMMON.PROJECT_SELECT_DROPDOWN.PLACEHOLDER')"
                           :selected.sync="selectedProjectItems"
                           @delete-tag="handleDeleteTag"
        >
            <template #menu-no-data-format>
                <div />
            </template>
            <template #menu-menu>
                <p-tree :edit-options="{disabled: true}"
                        :drag-options="{disabled: true}"
                        :toggle-options="toggleOptions"
                        :select-options="selectOptions"
                        :data-setter="dataSetter"
                        :data-getter="dataGetter"
                        :data-fetcher="dataFetcher"
                        @init="onTreeInit"
                        @change-select="onChangeSelect"
                >
                    <template #data="{node}">
                        <span class="ml-1">{{ node.data.name }}</span>
                    </template>
                    <template #toggle-right="{node, path}">
                        <span>
                            <component :is="selectComponent"
                                       :selected="selectedProjects" :value="node.data"
                                       :predicate="predicate"
                                       class="mr-1"
                                       @change="changeSelectState(node, path, ...arguments)"
                            />
                            <p-i :name="node.data.item_type === 'PROJECT_GROUP' ? 'ic_tree_project-group' : 'ic_tree_project'"
                                 width="1rem" height="1rem"
                            />
                        </span>
                    </template>
                </p-tree>
            </template>
        </p-search-dropdown>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PCheckBox, PI, PRadio, PSearchDropdown, PSelectDropdown, PTag, PTree,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { ProjectGroup } from '@/services/identity/service-account/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ProjectItemResp, ProjectTreeItem, ProjectTreeRoot } from '@/services/project/type';

import { store } from '@/store';
import { ResourceMap } from '@/store/modules/resource/type';

export default {
    name: 'ProjectSelectDropdown',
    components: {
        PSearchDropdown,
        PSelectDropdown,
        PTag,
        PTree,
        PRadio,
        PCheckBox,
        PI,
    },
    props: {
        selectedProjectIds: {
            type: Array,
            default: () => [],
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        projectGroupSelectable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            root: null as ProjectTreeRoot|null,
            selectedItems: [] as ProjectTreeItem[],
            selectedItem: computed<ProjectTreeItem>(() => state.selectedItems[0]),
            selectedProjects: computed<ProjectItemResp[]>(() => state.selectedItems.map(d => d.node.data)),
            _selectedProjectIds: [...props.selectedProjectIds] as string[],
            selectedProjectItems: computed<MenuItem[]>({
                get() {
                    const projects: ResourceMap = {
                        ...store.state.resource.project.items,
                        ...store.state.resource.projectGroup.items,
                    };
                    return state._selectedProjectIds.map(id => ({
                        name: id,
                        label: projects[id]?.label,
                    }));
                },
                set(val) {
                    state._selectedProjectIds = val.map(d => d.name);
                },
            }),
            selectComponent: computed(() => {
                if (props.multiSelectable) return PCheckBox;
                return PRadio;
            }),
            loading: true,
            selectOptions: computed(() => ({
                multiSelectable: props.multiSelectable,
                validator({ data }) {
                    return props.projectGroupSelectable ? true : data.item_type === 'PROJECT';
                },
            })),
            visibleMenu: false,
            isFocused: false,
        });

        const predicate = (current, data) => current?.id === data.id;

        const toggleOptions = {
            validator: node => node.data.item_type === 'PROJECT_GROUP' && (node.data.has_child || node.children.length > 0),
            toggleOnNodeClick: true,
        };
        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = node => node.data.name;
        const dataFetcher = async (node): Promise<ProjectGroup[]> => {
            if (!node) state.loading = true;
            try {
                const params: any = {
                    sort: { key: 'name', desc: false },
                    item_type: 'ROOT',
                    check_child: true,
                };

                if (node.data?.id && node.data?.item_type) {
                    params.item_id = node.data.id;
                    params.item_type = node.data.item_type;
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                console.error(e);
                return [];
            } finally {
                if (state.loading) state.loading = false;
            }
        };

        const getSearchPath = async (id: string, type: string): Promise<string[]> => {
            try {
                const res = await SpaceConnector.client.identity.project.tree.search({
                    item_id: id,
                    item_type: type,
                });
                return res.open_path || [];
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const findNodes = async () => {
            if (!state.root) return;

            const pathList: string[][] = await Promise.all(props.selectedProjectIds.map(d => getSearchPath(d, 'PROJECT')));
            const predicateList = pathList.map(paths => paths.map(d => (data => data.id === d)));
            await state.root.fetchAndFindNodes(predicateList);
        };

        const onTreeInit = async (root) => {
            state.root = root;

            if (props.selectedProjectIds.length) {
                await findNodes();
            } else {
                await root.fetchData();
            }
        };

        const onChangeSelect = (selected: ProjectTreeItem[]) => {
            if (state.selectedItems === selected) return;

            state.selectedItems = selected;
            state._selectedProjectIds = state.selectedProjects.map(d => d.id);

            if (!props.multiSelectable) {
                if (state.visibleMenu) state.visibleMenu = false;
                if (state.isFocused) state.isFocused = false;
            }

            emit('update:selectedProjectIds', state._selectedProjectIds);
            emit('select', state.selectedProjects);
        };

        const changeSelectState = (node, path, selected, value) => {
            if (state.root) state.root.changeSelectState(node, path, value);
        };

        const handleDeleteTag = (_, index: number) => {
            const { node, path } = state.selectedItems[index];
            if (state.root) state.root.changeSelectState(node, path, false);
        };


        return {
            ...toRefs(state),
            predicate,
            toggleOptions,
            dataSetter,
            dataGetter,
            dataFetcher,
            onTreeInit,
            onChangeSelect,
            changeSelectState,
            handleDeleteTag,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-select-dropdown {
    .p-select-dropdown::v-deep {
        display: block;
        width: 100%;
        .dropdown-button {
            width: 100%;
        }
    }
    .tag-wrapper {
        display: flex;
        flex-wrap: wrap;
    }
    .p-tree::v-deep {
        padding: 0.25rem;
    }

    .tag-box {
        @apply text-gray-900;
        margin-top: 0.625rem;
        .p-tag {
            margin-bottom: 0.5rem;
        }
    }
}
</style>
