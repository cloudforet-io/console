<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, toRef, watch,
} from 'vue';

import {
    PContextMenu, PI, useContextMenuController, PButtonModal,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';

interface Props {
    menu: SelectDropdownMenuItem[];
    selected: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'select', value?: string): void;}>();

const state = reactive({
    menuItems: computed(() => props.menu),
    selectedItems: undefined,
    selectedItemLabel: computed(() => {
        const selectedItem = state.menuItems.find((item) => item.name === state.selectedItems);
        return selectedItem ? selectedItem.label : '';
    }),
});
const modalState = reactive({
    visible: false,
    headerTitle: computed(() => 'Do you want to change the data?'),
    description: computed(() => 'Note that all options set below will be reset.'),
    beforeSelectedItem: undefined as string|undefined,
    afterSelectedItem: undefined as string|undefined,
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
    showMoreMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    useFixedStyle: true,
    menu: toRef(state, 'menuItems'),
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

const handleClickShowMore = async (item: SelectDropdownMenuItem) => {
    await showMoreMenu(item._resultIndex);
};

const handleSelectMenuItem = (item: SelectDropdownMenuItem) => {
    if (state.selectedItems[0].name === item.name) {
        hideContextMenu();
        return;
    }
    modalState.beforeSelectedItem = state.selectedItems[0].name;
    modalState.afterSelectedItem = item.name;
    modalState.visible = true;
};

const handleConfirmModal = () => {
    hideContextMenu();
    emit('select', modalState.afterSelectedItem);
    resetModalState();
};
const handleCancelModal = () => {
    state.selectedItems = [state.menuItems.find((item) => item.name === modalState.beforeSelectedItem)];
    resetModalState();
};

const resetModalState = () => {
    modalState.visible = false;
    modalState.beforeSelectedItem = undefined;
    modalState.afterSelectedItem = undefined;
};

watch(() => props.selected, () => {
    const selectedMenu = props.menu.find((item) => item.name === props.selected);
    state.selectedItems = [selectedMenu];
}, { immediate: true });

</script>

<template>
    <div ref="containerRef"
         :class="{'widget-form-data-table-card-source-item-dropdown': true, opened: visibleMenu}"
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
                        :style="contextMenuStyle"
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
            <p>{{ modalState.description }}</p>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-source-item-dropdown {
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
</style>
