<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, defineEmits, reactive, ref, toRef, watch,
} from 'vue';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';


const emit = defineEmits<{(e: 'disable-filter', value: string): void;
    (e: 'disable-all-filters'): void;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    menuItems: computed<MenuItem[]>(() => costAnalysisPageStore.defaultGroupByItems),
    selectedItems: [] as MenuItem[],
    searchText: '',
});

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const {
    visibleMenu,
    refinedMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
    initiateMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    menu: toRef(state, 'menuItems'),
    selected: toRef(state, 'selectedItems'),
    searchText: toRef(state, 'searchText'),
});
onClickOutside(containerRef, hideContextMenu);

const handleClickAddMore = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        initiateMenu();
        showContextMenu();
    }
};
const handleSelectAddMoreMenuItem = (item: MenuItem, _, isSelected: boolean) => {
    costAnalysisPageStore.$patch((_state) => {
        if (isSelected) {
            _state.enabledFiltersProperties = [...(_state.enabledFiltersProperties ?? []), item.name as string];
        } else {
            _state.enabledFiltersProperties = _state.enabledFiltersProperties?.filter((d) => d !== item.name);
            emit('disable-filter', item.name as string);
        }
    });
};
const handleClearAddMoreMenuItems = () => {
    costAnalysisPageStore.$patch((_state) => {
        _state.enabledFiltersProperties = [];
        emit('disable-all-filters');
    });
};

watch(() => costAnalysisPageState.enabledFiltersProperties, (_enabledFiltersProperties) => {
    if (_enabledFiltersProperties?.length) {
        state.selectedItems = state.menuItems.filter((d) => _enabledFiltersProperties.includes(d.name));
    }
});
</script>

<template>
    <div ref="containerRef"
         class="cost-analysis-add-more-button"
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
                        :style="contextMenuStyle"
                        :menu="refinedMenu"
                        :selected="state.selectedItems"
                        multi-selectable
                        show-select-marker
                        show-clear-selection
                        @select="handleSelectAddMoreMenuItem"
                        @clear-selection="handleClearAddMoreMenuItems"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-add-more-button {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    .add-more-context-menu {
        min-width: 10rem;
    }
}
</style>
