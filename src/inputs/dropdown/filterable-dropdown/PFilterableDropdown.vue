<template>
    <div v-on-click-outside="hideMenu"
         class="p-filterable-dropdown"
         :class="{ disabled, opened: proxyVisibleMenu, invalid }"
    >
        <div ref="targetRef"
             class="dropdown-button"
             :tabindex="disabled || readonly ? -1 : 0"
             @keyup.down="focusMenu"
             @keyup.esc.capture.stop="hideMenu"
             @keyup.enter.capture.stop="toggleMenu"
             @click="toggleMenu"
        >
            <div class="selection-display-wrapper">
                <span v-if="displayValueOnDropdownButton"
                      class="selected-item"
                >
                    {{ displayValueOnDropdownButton }}
                    <p-badge v-if="displayBadgeValueOnDropdownButton">
                        {{ displayBadgeValueOnDropdownButton }}
                    </p-badge>
                </span>
                <div v-else-if="showTagsOnDropdownButton"
                     class="tags-wrapper"
                >
                    <p-tag v-for="(item, idx) in proxySelected"
                           :key="item.name"
                           class="selected-tag"
                           @delete="handleTagDelete(item, idx)"
                    >
                        {{ item.label || item.name }}
                    </p-tag>
                </div>
                <span v-if="showDeleteAllButton"
                      class="delete-all-button"
                      @click.stop="handleClickDeleteAll"
                >
                    <p-i name="ic_delete"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                </span>
            </div>
            <span class="arrow-button"
                  @click.stop="toggleMenu"
            >
                <p-i :name="proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                     width="1.5rem"
                     height="1.5rem"
                     color="inherit"
                />
            </span>
        </div>
        <p-context-menu v-show="proxyVisibleMenu"
                        ref="menuRef"
                        class="dropdown-context-menu"
                        :search-text="proxySearchText"
                        searchable
                        :menu="displayMenuItems"
                        :loading="props.loading || handlerLoading"
                        :readonly="props.readonly"
                        :selected="proxySelected"
                        :multi-selectable="props.multiSelectable"
                        :show-select-header="props.showSelectHeader"
                        :show-select-marker="props.showSelectMarker"
                        :style="fixedMenuStyle"
                        :class="{ default: !props.showSelectMarker }"
                        @select="handleSelectMenuItem"
                        @click-done="hideMenu"
                        @click-show-more="handleClickShowMore"
                        @keyup:up:end="focusDropdownButton"
                        @keyup:down:end="focusMenu"
                        @keyup:esc="hideMenu"
                        @update:selected="handleUpdateSelected"
                        @update:search-text="handleUpdateSearchText"
        >
            <template v-for="(_, slot) of menuSlots"
                      #[slot]="scope"
            >
                <slot :name="`menu-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-context-menu>
    </div>
</template>

<script setup lang="ts">
import {
    computed, watch, useSlots, ref, toRef,
} from 'vue';

// CAUTION: this vOnClickOutside is using !! Please do not remove.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { vOnClickOutside } from '@vueuse/components';
import { useFocus } from '@vueuse/core';
import { reduce } from 'lodash';

import PBadge from '@/data-display/badges/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuController, useProxyValue } from '@/hooks';
import { useIgnoreWindowArrowKeydownEvents } from '@/hooks/ignore-window-arrow-keydown-events';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import {
    useFilterableDropdownButtonDisplay,
} from '@/inputs/dropdown/filterable-dropdown/composables/filterable-dropdown-button-display';
import {
    useFilterableDropdownMenuFiltering,
} from '@/inputs/dropdown/filterable-dropdown/composables/filterable-dropdown-menu-filtering';
import type {
    FilterableDropdownMenuItem,
    AutocompleteHandler, FilterableDropdownAppearanceType,
} from '@/inputs/dropdown/filterable-dropdown/type';
import { FILTERABLE_DROPDOWN_APPEARANCE_TYPES } from '@/inputs/dropdown/filterable-dropdown/type';

/* props */
interface FilterableDropdownProps {
    /* context menu props */
    menu?: FilterableDropdownMenuItem[];
    loading?: boolean;
    selected?: FilterableDropdownMenuItem[];
    multiSelectable?: boolean;
    searchText?: string;
    readonly?: boolean;
    showSelectHeader?: boolean;
    showSelectMarker?: boolean;
    /* others */
    visibleMenu?: boolean;
    useFixedMenuStyle?: boolean;
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    // eslint-disable-next-line vue/require-default-prop
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    appearanceType?: FilterableDropdownAppearanceType;
    // eslint-disable-next-line vue/require-default-prop
    pageSize?: number;
}
const props = withDefaults(defineProps<FilterableDropdownProps>(), {
    menu: () => [],
    loading: false,
    selected: () => [],
    searchText: '',
    visibleMenu: undefined,
    placeholder: undefined,
    appearanceType: FILTERABLE_DROPDOWN_APPEARANCE_TYPES[0],
});

/* event emits */
const emit = defineEmits<{(e: 'update:visible-menu', visibleMenu: boolean): void;
    (e: 'update:search-text', searchText: string): void;
    (e: 'update:selected', selected: FilterableDropdownMenuItem[]): void;
    (e: 'select', item: FilterableDropdownMenuItem): void;
    (e: 'delete-tag', item: FilterableDropdownMenuItem, index: number): void;
    (e: 'click-show-more'): void;
}>();

/* menu visibility */
const proxyVisibleMenu = useProxyValue<boolean>('visibleMenu', props, emit);
const hideMenu = () => {
    if (proxyVisibleMenu.value) {
        proxyVisibleMenu.value = false;
        proxySearchText.value = '';
    }
};
const showMenu = () => {
    if (!proxyVisibleMenu.value && !props.disabled) proxyVisibleMenu.value = true;
};
const toggleMenu = () => {
    if (proxyVisibleMenu.value) hideMenu();
    else showMenu();
};

/* context menu style */
const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement|null>(null);
const {
    fixedMenuStyle,
} = useContextMenuController({
    useFixedStyle: computed(() => props.useFixedMenuStyle),
    targetRef,
    contextMenuRef: menuRef,
    visibleMenu: proxyVisibleMenu,
});

/* focusing */
const { focused: focusedOnDropdownButton } = useFocus(targetRef);
const focusDropdownButton = () => {
    if (focusedOnDropdownButton.value) return;
    focusedOnDropdownButton.value = true;
};
const focusMenu = () => {
    if (!proxyVisibleMenu.value) showMenu();
    if (menuRef.value) menuRef.value.focus();
};

/* menu filtering */
const proxySearchText = useProxyValue('searchText', props, emit);
const {
    handlerLoading,
    displayMenuItems,
    resetMenu,
    filterMenu,
    attachMoreItems,
} = useFilterableDropdownMenuFiltering({
    searchText: proxySearchText,
    disableHandler: toRef(props, 'disableHandler'),
    handler: toRef(props, 'handler'),
    menu: toRef(props, 'menu'),
    pageSize: toRef(props, 'pageSize'),
});
const handleClickShowMore = async () => {
    await attachMoreItems();
    emit('click-show-more');
};
const handleUpdateSearchText = (searchText: string) => {
    proxySearchText.value = searchText;
    filterMenu();
};
watch([() => props.menu, proxyVisibleMenu], ([, visibleMenu]) => {
    if (visibleMenu) {
        resetMenu();
        filterMenu();
    }
}, { immediate: true });


/* selection */
const proxySelected = useProxyValue<FilterableDropdownMenuItem[]>('selected', props, emit);
const handleSelectMenuItem = (item: FilterableDropdownMenuItem) => {
    if (!props.multiSelectable) hideMenu();
    emit('select', item);
};
const handleUpdateSelected = (selectedItems: FilterableDropdownMenuItem[]) => {
    if (proxySelected.value !== selectedItems && !(proxySelected.value.length === 0 && selectedItems.length === 0)) {
        proxySelected.value = selectedItems;
    }
};

/* deletion */
const showDeleteAllButton = computed(() => {
    if (props.disabled) return false;
    if (props.readonly) return false;
    return !!proxySelected.value.length;
});
const handleClickDeleteAll = () => {
    if (proxySelected.value.length) {
        proxySelected.value = [];
    }
};
const handleTagDelete = (item: FilterableDropdownMenuItem, idx: number) => {
    const selectedClone = [...proxySelected.value];
    selectedClone.splice(idx, 1);
    proxySelected.value = selectedClone;
    emit('delete-tag', item, idx);
};

/* disabled */
watch(() => props.disabled, (disabled) => {
    if (disabled) hideMenu();
});

/* slots */
const slots = useSlots();
const menuSlots = computed(() => reduce(slots, (res, d, name) => {
    if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
    return res;
}, {}));

/* dropdown button display */
const {
    displayValueOnDropdownButton,
    showTagsOnDropdownButton,
    displayBadgeValueOnDropdownButton,
} = useFilterableDropdownButtonDisplay({
    multiSelectable: toRef(props, 'multiSelectable'),
    selected: proxySelected,
    appearanceType: toRef(props, 'appearanceType'),
    placeholder: toRef(props, 'placeholder'),
});

/* ignore window arrow keydown event */
useIgnoreWindowArrowKeydownEvents({ predicate: proxyVisibleMenu });
</script>

<style lang="postcss">
.p-filterable-dropdown {
    @apply w-full;
    position: relative;
    > .dropdown-button {
        @apply bg-white border rounded-md border-gray-300;
        display: flex;
        width: 100%;
        min-height: 2rem;
        cursor: pointer;
        > .selection-display-wrapper {
            flex-grow: 1;
            display: flex;
            width: 100%;
            > .selected-item {
                @apply text-label-md text-gray-900;
                flex-grow: 1;
                padding: 0.375rem 0.5rem;
            }
            > .tags-wrapper {
                flex-grow: 1;
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                padding: 0.375rem 0.5rem;
                > .selected-tag {
                    margin: 0;
                }
            }
            > .delete-all-button {
                @apply text-gray-400;
                flex-shrink: 0;
                display: inline-flex;
                align-items: center;
                cursor: pointer;
                height: 2rem;
                width: 1rem;
            }
        }
        .arrow-button {
            @apply text-gray-900;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            height: 2rem;
            width: 2rem;
        }
    }
    > .dropdown-context-menu {
        position: absolute;
        z-index: 1000;
        min-width: 100%;
        width: 100%;
    }

    &.disabled {
        > .dropdown-button {
            @apply bg-gray-100 border-gray-300;
            cursor: not-allowed;
            > .selection-display-wrapper {
                > .selected-item {
                    @apply text-gray-300;
                }
                > .delete-all-button {
                    cursor: not-allowed;
                }
            }
            > .arrow-button {
                @apply text-gray-300;
                cursor: not-allowed;
            }
        }
    }

    &.opened {
        > .dropdown-button {
            @apply border-secondary;
            > .selection-display-wrapper {
                > .selected-item {
                    @apply text-secondary;
                }
            }
            > .arrow-button {
                @apply text-secondary;
            }
        }
    }

    &.invalid {
        > .dropdown-button {
            @apply border-alert;
        }
    }

    @media (hover: hover) {
        &:not(.disabled):hover {
            > .dropdown-button .arrow-button {
                @apply text-secondary;
            }
            &:not(.invalid) {
                > .dropdown-button {
                    @apply border-secondary;
                }
            }
        }
    }
}
</style>
