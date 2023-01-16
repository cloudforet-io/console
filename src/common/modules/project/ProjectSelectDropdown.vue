<template>
    <div class="project-select-dropdown">
        <p-filterable-dropdown :loading="loading"
                               :visible-menu="visibleMenu"
                               show-select-marker
                               :multi-selectable="multiSelectable"
                               :use-fixed-menu-style="useFixedMenuStyle"
                               :invalid="invalid"
                               :disabled="disabled"
                               :placeholder="$t('COMMON.PROJECT_SELECT_DROPDOWN.PLACEHOLDER')"
                               :selected.sync="selectedItems"
                               :readonly="readonly"
                               disable-handler
                               appearance-type="stack"
                               @update:visible-menu="handleUpdateVisibleMenu"
                               @delete-tag="handleDeleteTag"
        >
            <template #menu-no-data-format>
                <div />
            </template>
            <template #menu-menu>
                <div class="button-wrapper top">
                    <p-button icon-left="ic_refresh"
                              style-type="tertiary"
                              size="sm"
                              :disabled="loading"
                              @click.stop="refreshProjectTree"
                    >
                        {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.RELOAD_PROJECT') }}
                    </p-button>
                </div>
                <p-tree :key="contextKey"
                        :edit-options="{disabled: true}"
                        :drag-options="{disabled: true}"
                        :toggle-options="toggleOptions"
                        :select-options="selectOptions"
                        :data-setter="dataSetter"
                        :data-getter="dataGetter"
                        :data-fetcher="dataFetcher"
                        @init="handleTreeInit"
                        @change-select="handleTreeChangeSelect"
                >
                    <template #data="{node}">
                        <span class="ml-1">{{ node.data.name }}</span>
                    </template>
                    <template #toggle-right="{node, path}">
                        <span>
                            <component :is="selectComponent"
                                       v-if="(node.data.item_type === 'PROJECT' && projectSelectable) || (node.data.item_type === 'PROJECT_GROUP' && projectGroupSelectable)"
                                       :selected="selectedProjects"
                                       :value="node.data"
                                       :predicate="predicate"
                                       class="mr-1"
                                       @change="handleChangeSelectState(node, path, ...arguments)"
                            />
                            <p-i :name="node.data.item_type === 'PROJECT_GROUP' ? 'ic_tree_project-group' : 'ic_tree_project'" />
                        </span>
                    </template>
                </p-tree>
                <div class="button-wrapper">
                    <p-button icon-left="ic_plus_bold"
                              class="create-button"
                              style-type="secondary"
                              size="sm"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.CREAT_PROJECT') }}
                    </p-button>
                </div>
            </template>
        </p-filterable-dropdown>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PCheckBox, PI, PRadio, PFilterableDropdown, PSelectDropdown, PTag, PTree, PButton,
} from '@spaceone/design-system';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ReferenceMap } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProjectGroup } from '@/services/asset-inventory/service-account/type';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import type { ProjectItemResp, ProjectTreeItem, ProjectTreeRoot } from '@/services/project/type';

export default {
    name: 'ProjectSelectDropdown',
    components: {
        PFilterableDropdown,
        PSelectDropdown,
        PTag,
        PTree,
        PRadio,
        PCheckBox,
        PI,
        PButton,
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
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        projectSelectable: {
            type: Boolean,
            default: false,
        },
        projectGroupSelectable: {
            type: Boolean,
            default: false,
        },
        useFixedMenuStyle: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit }: SetupContext) {
        const storeState = reactive({
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
        });
        const state = reactive({
            loading: true,
            visibleMenu: false,
            root: null as ProjectTreeRoot|null,
            // selected states
            selectedProjectItems: [] as ProjectTreeItem[],
            selectedProjects: computed<ProjectItemResp[]>(() => state.selectedProjectItems.map((d) => d.node.data)),
            _selectedProjectIds: [...props.selectedProjectIds] as string[],
            selectedItems: computed<FilterableDropdownMenuItem[]>({
                get() {
                    const items: ReferenceMap = {
                        ...storeState.projects,
                        ...storeState.projectGroups,
                    };
                    return state._selectedProjectIds.map((id) => ({
                        name: id,
                        label: items[id]?.label,
                    }));
                },
                set(val) {
                    state._selectedProjectIds = val.map((d) => d.name);
                },
            }),
            selectComponent: computed(() => {
                if (props.multiSelectable) return PCheckBox;
                return PRadio;
            }),
            contextKey: Math.floor(Math.random() * Date.now()),
        });

        const getSearchPath = async (id: string|undefined, type: string|undefined): Promise<string[]> => {
            if (!id) return [];
            try {
                const res = await SpaceConnector.client.identity.project.tree.search({
                    item_id: id,
                    item_type: type,
                });
                return res.open_path || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const findNodes = async () => {
            if (!state.root) return;

            const pathList: string[][] = await Promise.all(props.selectedProjectIds.map((d) => getSearchPath(d, props.projectGroupSelectable ? 'PROJECT_GROUP' : 'PROJECT')));
            const predicateList = pathList.map((paths) => paths.map((d) => ((data) => data.id === d)));
            await state.root.fetchAndFindNodes(predicateList);
        };

        /* Tree props */
        const predicate = (current, data) => current?.id === data.id;
        const toggleOptions = {
            validator: (node) => node.data.item_type === 'PROJECT_GROUP' && (node.data.has_child || node.children.length > 0),
            toggleOnNodeClick: true,
        };
        const selectOptions = computed(() => ({
            multiSelectable: props.multiSelectable,
            validator({ data }) {
                return props.projectGroupSelectable ? true : data.item_type === 'PROJECT';
            },
        }));
        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = (node) => node.data.name;
        const dataFetcher = async (node): Promise<ProjectGroup[]> => {
            try {
                const params: any = {
                    sort: { key: 'name', desc: false },
                    item_type: 'ROOT',
                    check_child: true,
                };

                if (!props.projectSelectable) params.exclude_type = 'PROJECT';

                if (node.data?.id && node.data?.item_type) {
                    params.item_id = node.data.id;
                    params.item_type = node.data.item_type;
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        /* Handlers */
        const handleTreeInit = async (root) => {
            state.root = root;

            state.loading = true;
            if (props.selectedProjectIds.length) {
                await findNodes();
            } else {
                await root.fetchData();
            }
            state.loading = false;
        };

        const handleTreeChangeSelect = (selected: ProjectTreeItem[]) => {
            if (!props.multiSelectable && state.selectedProjectItems === selected) return;

            state.selectedProjectItems = selected;
            state._selectedProjectIds = state.selectedProjects.map((d) => d.id);

            if (!props.multiSelectable) {
                if (state.visibleMenu) state.visibleMenu = false;
            }

            emit('select', state.selectedProjects);
        };

        const handleChangeSelectState = (node, path, selected, value) => {
            if (state.root) state.root.changeSelectState(node, path, value);
        };

        const handleDeleteTag = (_, index: number) => {
            if (state.selectedProjectItems[index]) {
                const { node, path } = state.selectedProjectItems[index];
                if (state.root) state.root.changeSelectState(node, path, false);
            }
        };

        const handleUpdateVisibleMenu = (value) => {
            state.visibleMenu = value;
            if (!value) emit('close');
        };

        const refreshProjectTree = async () => {
            store.dispatch('reference/project/load', { force: true });
            state.contextKey = Math.floor(Math.random() * Date.now());
        };

        const handleClickCreateButton = () => {
            window.open(SpaceRouter.router.resolve({ name: PROJECT_ROUTE._NAME }).href);
            state.visibleMenu = false;
            handleUpdateVisibleMenu(false);
        };

        /* Watchers */
        watch(() => props.selectedProjectIds, async (after, before) => {
            if (after !== state._selectedProjectIds) {
                findNodes();

                /* when findNodes() has node delete function, this will be deprecated */
                if (after.length < before.length) {
                    const deletedId = before.filter((d) => !after.includes(d))[0];
                    const deletedIdx = state._selectedProjectIds.indexOf(deletedId);
                    handleDeleteTag(deletedId, deletedIdx);
                }
            }
        });

        watch(() => state._selectedProjectIds, (selectedProjectIds) => {
            if (selectedProjectIds !== props.selectedProjectIds) {
                emit('update:selectedProjectIds', selectedProjectIds);
            }
        });

        /* init */
        (async () => {
            await Promise.allSettled([
                // LOAD REFERENCE STORE
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
            ]);
        })();
        return {
            ...toRefs(state),
            predicate,
            toggleOptions,
            selectOptions,
            dataSetter,
            dataGetter,
            dataFetcher,
            handleTreeInit,
            handleTreeChangeSelect,
            handleChangeSelectState,
            handleDeleteTag,
            handleUpdateVisibleMenu,
            handleClickCreateButton,
            refreshProjectTree,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-select-dropdown {
    .button-wrapper {
        padding: 0.5rem;
        &.top {
            padding-bottom: 0.25rem;
        }
        .create-button {
            width: 100%;
        }
    }

    /* custom design-system component - p-tree */
    :deep(.p-tree) {
        padding: 0.25rem;
        min-height: 12rem;
        .toggle-right {
            @apply flex-shrink-0;
        }
    }

    /* custom design-system component - p-filterable-dropdown */
    :deep(.no-data) {
        padding: 0;
    }
}
</style>
