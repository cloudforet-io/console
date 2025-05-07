<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PI, PCheckbox, PButton, PIconButton, PTextHighlighting,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import type { DashboardControlActionType } from '@/services/_shared/dashboard/core/types/dashboard-control-menu-type';
import type { DashboardSharedEntryPoint } from '@/services/_shared/dashboard/core/types/dashboard-shared-type';
import DashboardFolderTreeItem from '@/services/dashboards/components/dashboard-folder/DashboardFolderTreeItem.vue';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



interface ControlButton {
    name: string;
    icon: string;
    clickEvent: () => void;
    disabled?: boolean;
    styleType?: string;
}
interface Props {
    entryPoint?: DashboardSharedEntryPoint;
    selectedIdMap: Record<string, boolean>;
    dashboardTreeData: TreeNode<DashboardTreeDataType>[];
    buttonDisableMap?: Record<string, boolean>;
    searchText?: string;
    // for dashboard create page
    disableLink?: boolean;
    disableFavorite?: boolean;
    disableControlLabels?: boolean;
    showAll?: boolean;
    showSingleControlButtons?: boolean;
    showControlButtons?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    entryPoint: () => DASHBOARD_SHARED_ENTRY_POINT.NONE_ENTRY_POINT,
    selectedIdMap: () => ({}),
    dashboardTreeData: () => ([]),
    buttonDisableMap: () => ({}),
    searchText: '',
    showSingleControlButtons: true,
    showAll: false,
});



const emit = defineEmits<{(e: 'update:selectedIdMap', selectedIdMap: Record<string, boolean>): void;
    (e: 'select-control-actions', type: DashboardControlActionType, id: string): void;
    (e: 'click-control-delete'): void;
    (e: 'click-control-move'): void;
    (e: 'click-control-clone'): void;
    (e: 'click-tree-item', node: TreeNode<DashboardTreeDataType>): void;
}>();
const state = reactive({
    proxySelectedIdMap: useProxyValue('selectedIdMap', props, emit),
    isAllSelected: computed(() => {
        if (props.dashboardTreeData.length === 0) return false;
        let _isAllSelected = true;
        props.dashboardTreeData.forEach((node) => {
            if (!state.proxySelectedIdMap[node.data.id]) _isAllSelected = false;
        });
        return _isAllSelected;
    }),
    isIndeterminate: computed<boolean>(() => {
        if (state.isAllSelected) return false;
        return Object.values(state.proxySelectedIdMap).some((v) => v);
    }),
    childrenShowMap: {} as Record<string, boolean>,
    controlButtons: computed<ControlButton[]>(() => [
        {
            name: 'clone',
            icon: 'ic_clone',
            clickEvent: () => emit('click-control-clone'),
            disabled: !!props.buttonDisableMap?.clone,
        },
        {
            name: 'move',
            icon: 'ic_move',
            clickEvent: () => emit('click-control-move'),
            disabled: !!props.buttonDisableMap?.move,
        },
        {
            name: 'delete',
            icon: 'ic_delete',
            clickEvent: () => emit('click-control-delete'),
            disabled: !!props.buttonDisableMap?.delete,
            styleType: 'negative-transparent',
        },
    ]),
    showAll: props.showAll,
    slicedTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (state.showAll) return props.dashboardTreeData;
        return props.dashboardTreeData.slice(0, 10);
    }),
});

/* Util */
const isIndeterminate = (node: TreeNode<DashboardTreeDataType>): boolean => {
    if (node.data.type === 'DASHBOARD' || !node.children) return false;
    if (node.children.length === 0) return false;
    // check all children are selected
    if (node.children.every((child) => state.proxySelectedIdMap[child.id])) return false;
    return node.children.some((child) => state.proxySelectedIdMap[child.id]);
};

/* Event */
const handleChangeAllSelected = (value: boolean) => {
    if (!value) {
        state.proxySelectedIdMap = {};
    } else {
        props.dashboardTreeData.forEach((node) => {
            state.proxySelectedIdMap[node.data.id] = true;
            if (node.data.type === 'FOLDER') {
                node.children?.forEach((child) => {
                    state.proxySelectedIdMap[child.id] = true;
                });
            }
        });
    }
    state.proxySelectedIdMap = { ...state.proxySelectedIdMap };
};
const handleSelectTreeItem = (node: TreeNode<DashboardTreeDataType>, value: [boolean]) => {
    const _isSelected = value[0];
    state.proxySelectedIdMap[node.data.id] = _isSelected;
    if (node.data.type === 'FOLDER') {
        if (node.children) {
            node.children.forEach((child) => {
                state.proxySelectedIdMap[child.id] = _isSelected;
            });
        }
    } else if (node.data.folder_id) {
        if (_isSelected) {
            state.proxySelectedIdMap[node.data.folder_id] = true;
        } else {
            const _folderNode = props.dashboardTreeData.find((n) => n.data.id === node.data.folder_id);
            if (_folderNode?.children?.every((child) => !state.proxySelectedIdMap[child.id])) {
                state.proxySelectedIdMap[node.data.folder_id] = false;
            }
        }
    }
    state.proxySelectedIdMap = { ...state.proxySelectedIdMap };
};
const handleClickCollapseButton = (node: TreeNode<DashboardTreeDataType>) => {
    if (state.childrenShowMap[node.data.id]) {
        state.childrenShowMap[node.data.id] = false;
    } else {
        state.childrenShowMap = { ...state.childrenShowMap, [node.data.id]: true };
    }
};
const handleClickTreeItem = (node: TreeNode<DashboardTreeDataType>) => {
    if (node.data.type === 'FOLDER') {
        handleClickCollapseButton(node);
    } else {
        emit('click-tree-item', node);
    }
};

const handleClickShowAll = () => {
    state.showAll = true;
};

const handleSelectControlActions = (type: DashboardControlActionType, id: string) => {
    emit('select-control-actions', type, id);
};
</script>

<template>
    <div class="dashboard-folder-tree">
        <div class="tree-header">
            <div class="left-part">
                <p-checkbox :selected="state.isAllSelected"
                            :indeterminate="state.isIndeterminate"
                            class="tree-checkbox"
                            @change="handleChangeAllSelected"
                />
                <span>{{ $t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME') }}</span>
            </div>
            <div v-if="props.showControlButtons"
                 class="right-part"
            >
                <p-icon-button v-for="controlButton in state.controlButtons"
                               :key="`control-button-${controlButton.name}`"
                               :name="controlButton.icon"
                               :disabled="controlButton.disabled"
                               :style-type="controlButton.styleType || 'transparent'"
                               size="sm"
                               @click="controlButton.clickEvent"
                />
            </div>
        </div>
        <div v-for="treeData in state.slicedTreeData"
             :key="`${treeData.data.id}-${treeData.data.type}`"
             class="tree-content-wrapper"
        >
            <div class="folder-row-wrapper">
                <p-checkbox :selected="state.proxySelectedIdMap[treeData.data.id]"
                            :indeterminate="isIndeterminate(treeData)"
                            class="item-checkbox"
                            @change="handleSelectTreeItem(treeData, $event)"
                />
                <p-i v-if="treeData.data.type === 'FOLDER'"
                     :name="state.childrenShowMap[treeData.data.id] ? 'ic_chevron-down' : 'ic_chevron-right'"
                     width="1rem"
                     height="1rem"
                     color="gray[600]"
                     @click="handleClickCollapseButton(treeData)"
                />
                <dashboard-folder-tree-item :entry-point="props.entryPoint"
                                            :tree-data="treeData"
                                            :disable-favorite="props.disableFavorite"
                                            :disable-control-labels="props.disableControlLabels"
                                            :disable-link="props.disableLink"
                                            :show-single-control-buttons="props.showSingleControlButtons"
                                            @select-control-actions="handleSelectControlActions"
                                            @click-tree-item="handleClickTreeItem"
                >
                    <template #text="{node}">
                        <p-text-highlighting :text="node.data.name"
                                             :term="props.searchText"
                        />
                    </template>
                </dashboard-folder-tree-item>
            </div>
            <template v-if="state.childrenShowMap[treeData.data.id]">
                <div v-for="child in treeData.children"
                     :key="`${child.data.id}-${child.data.type}`"
                     class="folder-row-wrapper"
                >
                    <p-checkbox :selected="state.proxySelectedIdMap[child.data.id]"
                                class="item-checkbox"
                                @change="handleSelectTreeItem(child, $event)"
                    />
                    <dashboard-folder-tree-item :entry-point="props.entryPoint"
                                                :tree-data="child"
                                                :disable-link="props.disableLink"
                                                :disable-favorite="props.disableFavorite"
                                                :disable-control-labels="props.disableControlLabels"
                                                :show-single-control-buttons="props.showSingleControlButtons"
                                                class="child-tree-item"
                                                @select-control-actions="handleSelectControlActions"
                                                @click-tree-item="handleClickTreeItem"
                    >
                        <template #text="{node}">
                            <p-text-highlighting :text="node.data.name"
                                                 :term="props.searchText"
                            />
                        </template>
                    </dashboard-folder-tree-item>
                </div>
                <div v-if="!treeData.children?.length"
                     class="folder-row-wrapper no-dashboard"
                >
                    <span>{{ $t('DASHBOARDS.ALL_DASHBOARDS.NO_DASHBOARD') }}</span>
                </div>
            </template>
        </div>
        <div v-if="!state.showAll && props.dashboardTreeData.length > 10"
             class="show-all-wrapper"
        >
            <p-button style-type="transparent"
                      size="sm"
                      @click="handleClickShowAll"
            >
                {{ $t('DASHBOARDS.ALL_DASHBOARDS.SHOW_ALL') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-folder-tree {
    @apply bg-white rounded-md border border-gray-200;
    .tree-header {
        @apply border-b-2 border-gray-200 text-label-md rounded-t-md;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-weight: 700;
        padding: 0.6rem 0.5rem;
    }
    .tree-checkbox {
        padding-right: 0.5rem;
    }
    .tree-content-wrapper {
        &:last-child {
            .folder-row-wrapper {
                &:last-child {
                    @apply border-b-0;
                }
            }
        }
    }
    .folder-row-wrapper {
        @apply flex items-center border-b border-gray-200;
        padding: 0 0.5rem;
        cursor: pointer;
        &:hover {
            @apply bg-blue-100;
        }
        &.no-dashboard {
            @apply text-paragraph-md text-gray-300;
            padding: 0.5rem 0.5rem 0.5rem 2.875rem;
        }
        .child-tree-item {
            margin-left: 1rem;
        }

        @screen tablet {
            .item-checkbox {
                align-self: flex-start;
                padding: 0.5rem 0;
            }
        }
    }
    .show-all-wrapper {
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
