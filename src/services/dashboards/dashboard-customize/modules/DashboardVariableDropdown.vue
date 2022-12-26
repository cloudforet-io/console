<template>
    <div v-on-click-outside="hideContextMenu"
         class="dashboard-variable-dropdown"
    >
        <div ref="targetRef"
             class="dropdown-box"
             :class="{ 'is-visible': visibleMenu, 'filled-value': state.selected.length }"
        >
            <span class="variable-label">{{ variableName }}</span>
            <div v-if="state.selected.length"
                 class="selected-items"
            >
                <span class="item-for-display">{{ state.selected[0].label }}</span>
                <p-badge v-if="state.selected.length > 1"
                         style-type="blue300"
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
        </div>
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
// import { useContextMenuController } from '@spaceone/design-system/src/hooks/context-menu-controller';

const props = defineProps<{
    variableName: string;
    menu: MenuItem[];
}>();

const state = reactive({
    menu: props.menu ?? [] as MenuItem[],
    selected: [
        { name: 'spaceone', label: 'SpaceONE Dev' },
        { name: 'spaceone', label: 'SpaceONE Dev' },
        { name: 'spaceone', label: 'SpaceONE Dev' },
    ] as MenuItem[],
});
// const {
//     visibleMenu,
//     // showContextMenu,
//     hideContextMenu,
//     // focusOnContextMenu,
//     // reorderMenuBySelection,
//     // fixedMenuStyle,
// } = useContextMenuController({
//     targetRef: ref(null),
//     contextMenuRef: ref(null),
//     useReorderBySelection: true,
//     useFixedStyle: true,
// });
const visibleMenu = ref(false);
const hideContextMenu = () => {
    console.log('hide menu');
};

</script>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {
    @apply inline-block;

    .dropdown-box {
        @apply flex items-center border border-solid border-gray-300 bg-white rounded-md;
        height: 2rem;
        padding: 0 0.25rem 0 0.75rem;

        .variable-label {
            @apply text-gray-900 text-label-md;
        }

        .selected-items {
            @apply inline-flex items-center;
            padding: 0 0.5rem;

            .item-for-display {
                @apply text-gray-900 text-label-md font-bold;
                margin-right: 0.25rem;
            }
        }

        &:hover {
            @apply border-blue-600 bg-blue-100;
        }
        &.is-visible {
            @apply border-blue-600;
        }
        &.filled-value {
            @apply border-blue-400 bg-blue-200;
        }
    }
}
</style>
