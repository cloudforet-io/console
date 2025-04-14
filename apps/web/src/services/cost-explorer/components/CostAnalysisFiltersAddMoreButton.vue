<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, toRef, watch,
} from 'vue';

import { cloneDeep, debounce } from 'lodash';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import {
    useCostDataSourceFilterMenuItems,
} from '@/common/composables/data-source/use-cost-data-source-filter-menu-items';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';



const emit = defineEmits<{(e: 'disable-filter', value: string): void;
    (e: 'disable-all-filters'): void;
}>();

const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const { managedGroupByItems, additionalInfoGroupByItems, tagsFilterItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => storeState.isAdminMode),
    costDataSource: computed(() => storeState.costDataSource[costAnalysisPageGetters.selectedDataSourceId ?? '']),
});

const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const defaultGroupByItems = [
            ...managedGroupByItems.value,
            ...additionalInfoGroupByItems.value,
        ];
        const tagsMenuItems = cloneDeep(tagsFilterItems.value);
        if (!tagsMenuItems.length) {
            return defaultGroupByItems;
        }
        return [
            ...defaultGroupByItems,
            { type: 'header', label: 'Tags', name: 'tags' },
            ...tagsMenuItems,
        ];
    }),
    initiated: false,
    selectedItems: [] as MenuItem[],
    searchText: '',
    dataSourceId: computed<string>(() => (costAnalysisPageGetters.isUnifiedCost ? UNIFIED_COST_KEY : (costAnalysisPageGetters.selectedDataSourceId ?? ''))),
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
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useMenuFiltering: true,
    useReorderBySelection: true,
    menu: toRef(state, 'menuItems'),
    selected: toRef(state, 'selectedItems'),
    searchText: toRef(state, 'searchText'),
    pageSize: 10,
});
onClickOutside(containerRef, hideContextMenu);

/* Event */
const handleClickAddMore = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        initiateMenu();
        showContextMenu();
    }
};
const handleSelectAddMoreMenuItem = (item: MenuItem, _, isSelected: boolean) => {
    if (isSelected) {
        costAnalysisPageStore.setEnabledFiltersProperties([
            ...(costAnalysisPageState.enabledFiltersProperties ?? []),
            item.name as string,
        ]);
    } else {
        costAnalysisPageStore.setEnabledFiltersProperties(
            costAnalysisPageState.enabledFiltersProperties?.filter((d) => d !== item.name) ?? [],
        );
        emit('disable-filter', item.name as string);
    }
};
const handleClearAddMoreMenuItems = () => {
    costAnalysisPageStore.setEnabledFiltersProperties([]);
    emit('disable-all-filters');
};
const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);
const handleClickShowMore = async () => {
    await showMoreMenu();
};

watch(() => costAnalysisPageState.enabledFiltersProperties, (_enabledFiltersProperties) => {
    if (_enabledFiltersProperties?.length) {
        state.selectedItems = state.menuItems.filter((d) => _enabledFiltersProperties.includes(d.name));
    }
}, { immediate: true });
</script>

<template>
    <div ref="containerRef"
         class="cost-analysis-filters-add-more-button"
    >
        <p-button ref="targetRef"
                  style-type="transparent"
                  icon-left="ic_plus_bold"
                  @click="handleClickAddMore"
        >
            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ADD_MORE') }}
        </p-button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        class="add-more-context-menu"
                        searchable
                        :search-text="state.searchText"
                        :menu="refinedMenu"
                        :selected="state.selectedItems"
                        multi-selectable
                        show-select-marker
                        show-clear-selection
                        @select="handleSelectAddMoreMenuItem"
                        @clear-selection="handleClearAddMoreMenuItems"
                        @click-show-more="handleClickShowMore"
                        @update:search-text="handleUpdateSearchText"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-filters-add-more-button {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    .add-more-context-menu {
        min-width: 10rem;
        width: max-content;
    }
}
</style>
