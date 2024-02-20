<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, defineEmits, reactive, ref, toRef, watch,
} from 'vue';

import {
    PButton, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { debounce } from 'lodash';

import { VariableModel } from '@/lib/variable-models';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed-model-configs/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';


const emit = defineEmits<{(e: 'disable-filter', value: string): void;
    (e: 'disable-all-filters'): void;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;

const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const tagsMenuItems = state.tagsMenuItems;
        if (!tagsMenuItems.length) return costAnalysisPageGetters.defaultGroupByItems;
        return [
            ...costAnalysisPageGetters.defaultGroupByItems,
            { type: 'header', label: 'Tags', name: 'tags' },
            ...tagsMenuItems,
        ];
    }),
    initiated: false,
    tagsMenuItems: [] as MenuItem[],
    selectedItems: [] as MenuItem[],
    searchText: '',
    dataSourceId: computed<string>(() => costAnalysisPageGetters.selectedDataSourceId ?? ''),
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
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    useFixedStyle: true,
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

const costTagKeysVariableModel = new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_tag_key.key });
/* Api */
const getTagsResources = async (): Promise<{name: string; key: string}[]> => {
    try {
        const options = {
            cost_data_source: state.dataSourceId,
        };
        const response = await costTagKeysVariableModel.list({ options });
        return response.results;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return [];
    }
};

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

watch(() => state.dataSourceId, async (dataSourceId) => {
    if (!dataSourceId) return;
    state.initiated = false;
    const tagsResources = await getTagsResources();
    state.tagsMenuItems = tagsResources ? tagsResources.map((d) => ({ name: d.key, label: d.name })) : [];
    state.initiated = true;
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
                        :loading="!state.initiated"
                        :search-text="state.searchText"
                        :style="contextMenuStyle"
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
    }
}
</style>
