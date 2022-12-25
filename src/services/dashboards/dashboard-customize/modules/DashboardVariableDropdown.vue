<template>
    <div v-on-click-outside="hideContextMenu"
         class="dashboard-variable-dropdown"
    >
        <button ref="targetRef"
                class="dropdown-box"
                :class="{ 'is-visible': visibleMenu }"
        >
            <span>{{ variableName }}</span>
            <div v-if="state.selected.length"
                 class="selected-items"
            >
                <span class="item-for-display">{{ state.selected[0].label }}</span>
                <p-badge v-if="state.selected.length > 1"
                         style-type="blue200"
                >
                    +{{ state.selected.length - 1 }}
                </p-badge>
            </div>
            <span />
            <p-i :name="visibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                 :activated="visibleMenu"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        :menu="state.menu"
        />
    </div>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    reactive, ref,
} from 'vue';

import { PBadge, PContextMenu, PI } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { useContextMenuController } from '@spaceone/design-system/src/hooks/context-menu-controller';

const props = defineProps<{
    variableName: string;
    menu: MenuItem[];
}>();

const state = reactive({
    menu: props.menu ?? [] as MenuItem[],
    selected: [] as MenuItem[],
});
const {
    visibleMenu,
    // showContextMenu,
    hideContextMenu,
    // focusOnContextMenu,
    // reorderMenuBySelection,
    // fixedMenuStyle,
} = useContextMenuController({
    targetRef: ref(null),
    contextMenuRef: ref(null),
    useReorderBySelection: true,
    useFixedStyle: true,
});
</script>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {

    .dropdown-box {
        @apply border border-solid border-blue-400 bg-blue-200 rounded-md;

        .selected-items {
            @apply inline-flex items-center;

            .item-for-display {
                /* implementation */
            }
        }

        &.is-visible {
            @apply border-blue-600;
        }

        &:hover {
            @apply border-blue-600;
        }
    }
}
</style>
