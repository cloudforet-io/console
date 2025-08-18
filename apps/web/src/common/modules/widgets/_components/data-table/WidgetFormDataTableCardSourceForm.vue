<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, toRef,
} from 'vue';

import {
    PContextMenu, PI, useContextMenuController, PButtonModal,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { CostDataSourceReferenceItem } from '@/query/resource-query/reference-data-model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { i18n } from '@/translations';

import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';


interface Props {
    parentSourceId: string;
    sourceType?: string;
    selected: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'select', value?: string): void;}>();
const referenceMap = useAllReferenceDataModel();
const costDataSourceMap = referenceMap.costDataSource;
const metricMap = referenceMap.metric;
const namespaceMap = referenceMap.namespace;
const handlerMap = useResourceMenuHandlerMap();

const costDataTypeMenuItems = computed<MenuItem[]>(() => {
    if (props.sourceType !== DATA_SOURCE_DOMAIN.COST) return [];
    const targetCostDataSource: CostDataSourceReferenceItem|undefined = costDataSourceMap[props.parentSourceId];
    if (!targetCostDataSource) return [];
    const costAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.cost || targetCostDataSource?.data?.plugin_info?.metadata?.cost_info?.name;
    const costDataKeys = targetCostDataSource?.data?.cost_data_keys || [];
    const additionalMenuItems: MenuItem[] = costDataKeys.map((key) => ({
        name: `data.${key}`, label: key,
    }));
    return [
        { name: 'cost', label: costAlias ? `Cost (${costAlias})` : 'Cost' },
        { name: 'usage_quantity', label: 'Usage' },
        ...(additionalMenuItems || []),
    ];
});

const assetTypeMenuHandler = computed<AutocompleteHandler>(() => {
    if (props.sourceType !== DATA_SOURCE_DOMAIN.ASSET) return () => ({ results: [] });
    return handlerMap.metric({
        menuFilters: [{
            k: 'namespace_id',
            v: props.parentSourceId,
            o: '=',
        }],
    });
});

const state = reactive({
    selectedItems: computed<MenuItem[]>(() => {
        const selectedId = props.selected;
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return [{
                name: selectedId,
                label: costDataTypeMenuItems.value.find((item) => item.name === selectedId)?.label,
            }];
        }
        if (props.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return [{
                name: selectedId,
                label: metricMap[selectedId]?.label,
            }];
        }
        return [];
    }),
    selectedParentSourceName: computed(() => {
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return costDataSourceMap[props.parentSourceId]?.label;
        }
        if (props.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return namespaceMap[props.parentSourceId]?.label;
        }
        return '';
    }),
    sourceIcon: computed(() => {
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) return 'ic_data-domain-cost';
        if (props.sourceType === DATA_SOURCE_DOMAIN.ASSET) return 'ic_data-domain-asset';
        return '';
    }),
});
const modalState = reactive({
    visible: false,
    headerTitle: computed(() => i18n.t('COMMON.WIDGETS.CHANGE_DATA_MODAL_TITLE')),
    description: computed(() => i18n.t('COMMON.WIDGETS.CHANGE_DATA_MODAL_DESCRIPTION')),
    beforeSelectedItem: undefined as string|undefined,
    afterSelectedItem: undefined as string|undefined,
});

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const {
    visibleMenu,
    refinedMenu,
    showContextMenu,
    hideContextMenu,
    initiateMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    // useFixedStyle: true,
    handler: props.sourceType === DATA_SOURCE_DOMAIN.COST ? undefined : assetTypeMenuHandler,
    menu: props.sourceType === DATA_SOURCE_DOMAIN.COST ? costDataTypeMenuItems : undefined,
    selected: toRef(state, 'selectedItems'),
    pageSize: 10,
});
onClickOutside(containerRef, hideContextMenu);

const handleClickDropdown = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        initiateMenu();
        showContextMenu();
    }
};

const handleClickShowMore = async (item: MenuItem) => {
    await showMoreMenu(item._resultIndex);
};

const handleSelectMenuItem = (item: MenuItem) => {
    if (state.selectedItems?.[0]?.name === item.name) {
        hideContextMenu();
        return;
    }
    modalState.beforeSelectedItem = state.selectedItems?.[0]?.name;
    modalState.afterSelectedItem = item.name;
    modalState.visible = true;
};

const handleConfirmModal = () => {
    hideContextMenu();
    emit('select', modalState.afterSelectedItem);
    resetModalState();
};
const handleCancelModal = () => {
    resetModalState();
};

const resetModalState = () => {
    modalState.visible = false;
    modalState.beforeSelectedItem = undefined;
    modalState.afterSelectedItem = undefined;
};

</script>

<template>
    <div class="widget-form-data-table-card-source-form">
        <div class="selected-source">
            <div class="source-img">
                <p-i :name="state.sourceIcon"
                     width="1.25rem"
                     height="1.25rem"
                />
            </div>
            <span>{{ state.selectedParentSourceName }}</span>
        </div>
        <div ref="containerRef"
             :class="{'source-dropdown': true, opened: visibleMenu}"
        >
            <button ref="targetRef"
                    :class="{'source-item-dropdown-button': true}"
                    @click="handleClickDropdown"
            >
                <span class="selected-source-label">
                    {{ state.selectedItems[0]?.label }}
                </span>
                <span class="arrow-button">
                    <p-i :name="visibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                         width="1.5rem"
                         height="1.5rem"
                         color="inherit"
                    />
                </span>
            </button>
            <p-context-menu v-show="visibleMenu"
                            ref="contextMenuRef"
                            class="dropdown-context-menu"
                            :menu="refinedMenu"
                            :selected="state.selectedItems"
                            @select="handleSelectMenuItem"
                            @click-show-more="handleClickShowMore"
            />
            <p-button-modal :visible="modalState.visible"
                            size="sm"
                            theme-color="alert"
                            :header-title="modalState.headerTitle"
                            @confirm="handleConfirmModal"
                            @cancel="handleCancelModal"
            >
                <template #body>
                    <div class="h-10">
                        <span>{{ modalState.description }}</span>
                    </div>
                </template>
            </p-button-modal>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-source-form {
    margin-top: 0.5rem;
    .selected-source {
        @apply flex items-center gap-1 text-label-md text-gray-900;
        margin-bottom: 0.25rem;
        .source-img {
            @apply rounded flex items-center justify-center bg-violet-150;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
    .source-dropdown {
        @apply relative;
        .source-item-dropdown-button {
            @apply flex justify-between items-center bg-white border rounded border-gray-300 cursor-pointer;
            width: 100%;
            min-height: 2rem;
            gap: 0.25rem;
            padding-left: 0.5rem;

            .selected-source-label {
                @apply text-gray-800 text-label-md font-medium;
            }

            .arrow-button {
                @apply inline-flex items-center text-gray-600 cursor-pointer;
                width: 1.75rem;
            }
        }

        .dropdown-context-menu {
            @apply absolute;
            margin-top: -1px;
            z-index: 1000;
            min-width: 100%;
            width: auto;
        }

        &:hover {
            .source-item-dropdown-button {
                @apply border-secondary;
            }
        }
        &.opened {
            .source-item-dropdown-button {
                @apply border-secondary;
                .arrow-button {
                    @apply text-secondary;
                }
            }
        }
    }
}
</style>
