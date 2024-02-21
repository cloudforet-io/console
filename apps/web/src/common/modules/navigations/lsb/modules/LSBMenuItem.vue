<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PI, PSelectDropdown } from '@spaceone/design-system';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';
import LSBDividerMenuItem from '@/common/modules/navigations/lsb/modules/LSBDividerMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

interface Props {
    menuData: LSBMenu;
    currentPath: string;
    depth: number
}

const props = withDefaults(defineProps<Props>(), {
    menuData: () => ({}) as LSBItem,
    currentPath: undefined,
    depth: 1,
});
const emit = defineEmits<{(e: 'select', id: string, selected: string|number): void}>();
const appContextStore = useAppContextStore();
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    processedMenuData: computed<LSBMenu>(() => (Array.isArray(props.menuData) ? props.menuData : [props.menuData])),
    isFolded: false,
    isFoldableMenu: computed(() => state.processedMenuData?.some((item) => item.foldable)),
    showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
    hoveredItem: '',
});

const handleFoldableToggle = () => {
    state.isFolded = !state.isFolded;
};

const handleSelect = (id: string, selected: string) => {
    emit('select', id, selected);
};

</script>

<template>
    <div class="l-s-b-menu-list">
        <div v-for="(item, idx) in state.processedMenuData"
             :key="item.id"
             class="l-s-b-menu-item"
        >
            <p v-if="item.type === MENU_ITEM_TYPE.TITLE"
               class="title-wrapper"
            >
                <span v-if="item.foldable"
                      class="title foldable"
                      @click="handleFoldableToggle"
                >{{ item.label }}</span>
                <span v-else
                      class="title"
                >{{ item.label }}</span>
                <slot name="title-right"
                      v-bind="$props"
                />
                <new-mark v-if="item.highlightTag === 'new'" />
                <update-mark v-else-if="item.highlightTag === 'update'" />
                <beta-mark v-else-if="item.highlightTag === 'beta'" />
                <span v-if="item.foldable"
                      class="toggle-button"
                      @click="handleFoldableToggle"
                >
                    <p-i width="1rem"
                         height="1rem"
                         :name="state.isFolded ? 'ic_chevron-up' : 'ic_chevron-down'"
                         color="inherit transparent"
                    />
                </span>
            </p>
            <p v-else-if="item.type === MENU_ITEM_TYPE.TOP_TITLE"
               class="top-title-wrapper"
            >
                <span class="top-title">
                    {{ item.label }}
                </span>
                <p-i v-if="item.icon"
                     :name="item.icon.name"
                     class="top-title-icon"
                     width="0.75rem"
                     height="0.75rem"
                     :color="item.icon.color"
                />
            </p>
            <div v-else-if="item.type === MENU_ITEM_TYPE.DROPDOWN"
                 class="select-options-wrapper"
            >
                <p-select-dropdown class="select-options-dropdown"
                                   :menu="item.selectOptions.items"
                                   :selected="item.selectOptions.defaultSelected"
                                   @update:selected="handleSelect(item.id, $event)"
                />
            </div>
            <l-s-b-divider-menu-item v-else-if="item.type === MENU_ITEM_TYPE.DIVIDER && state.showMenu" />
            <l-s-b-router-menu-item v-else-if="item.type === MENU_ITEM_TYPE.ITEM && state.showMenu"
                                    :item="item"
                                    :depth="depth"
                                    :is-admin-mode="state.isAdminMode"
                                    :idx="idx"
                                    :current-path="currentPath"
            >
                <template v-for="(_, slot) of $scopedSlots"
                          #[slot]="scope"
                >
                    <slot :name="slot"
                          v-bind="scope"
                    />
                </template>
            </l-s-b-router-menu-item>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.l-s-b-menu-list {
    .title-wrapper {
        @apply text-gray-400 font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-left: 0.5rem;
        height: 2rem;
        .title {
            &.foldable {
                &:hover {
                    @apply text-gray-800 cursor-pointer underline;
                }
            }
        }

        .toggle-button {
            &:hover {
                @apply text-gray-800 cursor-pointer;
            }
        }
    }
    .top-title-wrapper {
        @apply font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-top: 1.25rem;
        padding-left: 0.5rem;
        padding-bottom: 0.75rem;
        .top-title-icon {
            margin-left: 0.25rem;
        }
    }
    .select-options-wrapper {
        padding: 0 0.5rem;
        .select-options-dropdown {
            @apply w-full;
        }
    }
}
</style>
