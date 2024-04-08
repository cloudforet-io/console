<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import LSBButtonTitleMenuItem from '@/common/modules/navigations/lsb/modules/LSBButtonTitleMenuItem.vue';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';
import LSBDividerMenuItem from '@/common/modules/navigations/lsb/modules/LSBDividerMenuItem.vue';
import LSBDropdownMenuItem from '@/common/modules/navigations/lsb/modules/LSBDropdownMenuItem.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import LSBStarredMenuItem from '@/common/modules/navigations/lsb/modules/LSBStarredMenuItem.vue';
import LSBTopTitleMenuItem from '@/common/modules/navigations/lsb/modules/LSBTopTitleMenuItem.vue';
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
    hoveredItem: '',
});

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
            <l-s-b-top-title-menu-item v-if="item.type === MENU_ITEM_TYPE.TOP_TITLE"
                                       :item="item"
            />
            <l-s-b-button-title-menu-item v-if="item.type === MENU_ITEM_TYPE.BUTTON_TITLE"
                                          :item="item"
            >
                <template #extra>
                    <slot name="button-title-extra" />
                </template>
            </l-s-b-button-title-menu-item>

            <l-s-b-divider-menu-item v-else-if="item.type === MENU_ITEM_TYPE.DIVIDER" />

            <l-s-b-dropdown-menu-item v-else-if="item.type === MENU_ITEM_TYPE.DROPDOWN"
                                      :item="item"
                                      @select="handleSelect"
            />
            <l-s-b-starred-menu-item v-else-if="item.type === MENU_ITEM_TYPE.STARRED"
                                     :item="item"
            />
            <l-s-b-collapsible-menu-item v-else-if="item.type === MENU_ITEM_TYPE.COLLAPSIBLE"
                                         :item="item"
            >
                <template v-for="(_, slot) of $scopedSlots"
                          #[slot]="scope"
                >
                    <slot :name="slot"
                          v-bind="scope"
                    />
                </template>
            </l-s-b-collapsible-menu-item>
            <l-s-b-router-menu-item v-else-if="item.type === MENU_ITEM_TYPE.ITEM"
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
