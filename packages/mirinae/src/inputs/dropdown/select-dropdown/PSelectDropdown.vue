<script setup lang="ts">
import {
    computed,
    reactive,
    nextTick,
    toRef,
    ref,
    useSlots,
    watch,
} from 'vue';

import { onClickOutside } from '@vueuse/core';
import { groupBy, reduce } from 'lodash';

import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import {
    SELECT_DROPDOWN_STYLE_TYPE,
    CONTEXT_MENU_POSITION,
    APPEARANCE_TYPE,
} from '@/inputs/dropdown/select-dropdown/type';

interface Props {
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
    invalid?: boolean;
    loading?: boolean;
    items?: MenuItem[];
    selected?: string | number | MenuItem[];
    disabled?: boolean;
    indexMode?: boolean;
    placeholder?: string;
    styleType?: SELECT_DROPDOWN_STYLE_TYPE;
    buttonIcon?: string;
    menuPosition?: CONTEXT_MENU_POSITION;
    readOnly?: boolean;
    isFixedWidth?: boolean;
    highlightSelectionState?: boolean;
    innerLabel?: string|boolean;
    deleteButton?: boolean;
    appearanceType?: APPEARANCE_TYPE;
}

const props = withDefaults(defineProps<Props>(), {
    useFixedMenuStyle: false,
    visibleMenu: undefined,
    isFixedWidth: false,
    styleType: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
    disabled: false,
    readOnly: false,
    invalid: false,
    loading: false,
    menuPosition: CONTEXT_MENU_POSITION.LEFT,
    placeholder: '',
    items: () => [],
    selected: undefined,
    indexMode: false,
    buttonIcon: undefined,
    highlightSelectionState: false,
    innerLabel: undefined,
    deleteButton: false,
    appearanceType: APPEARANCE_TYPE.DEFAULT,
});

const emit = defineEmits<{(e: 'update:selected', value?: string | number): void;
    (e: 'select', value?: string | number): void;
    (e: 'update:visible-menu', value?: boolean): void;
    (e: 'focus-menu'): void;
    (e: 'click-delete'): void;
}>();

const slots = useSlots();

const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean | undefined>('visibleMenu', props, emit),
    contextMenuRef: null as null|any,
    proxySelected: useProxyValue<string|number|undefined>('selected', props, emit),
    selectedItems: [] as MenuItem[],
    menuSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
        return res;
    }, {})),
    buttonSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('button-') || name === 'button-default') {
            res[`${name.substring(7)}`] = d;
        }
        return res;
    }, {})),
    innerText: computed<string>(() => {
        // TODO: need to check at console for translation.
        if (typeof (props.innerLabel) === 'string') {
            return state.selectedItems?.length > 0
                ? `${state.selectedItems[0].label || state.selectedItems[0].name || ''}`
                : (props.innerLabel || 'Label');
        }

        return state.selectedItems.length > 0
            ? (state.selectedItems[0].label || state.selectedItems[0].name || '')
            : (props.placeholder || 'Select');
    }),
});

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = toRef(state, 'contextMenuRef');

const {
    targetRef, contextMenuStyle,
} = useContextMenuFixedStyle({
    useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
    visibleMenu: toRef(state, 'proxyVisibleMenu'),
});

/* Event Handlers */
const onSelectMenu = (item: MenuItem, index) => {
    if (props.indexMode) {
        emit('select', index);
        state.proxySelected = index;
    } else {
        emit('select', item.name);
        state.proxySelected = item.name;
    }
    state.proxyVisibleMenu = false;
};
const handleClick = (e: MouseEvent) => {
    if (props.readOnly || props.disabled) return;
    state.proxyVisibleMenu = !state.proxyVisibleMenu;
    e.stopPropagation();
};
const handlePressDownKey = () => {
    if (!state.proxyVisibleMenu) state.proxyVisibleMenu = true;
    nextTick(() => {
        if (contextMenuRef.value) {
            if (slots['menu-menu']) emit('focus-menu');
            else state.contextMenuRef.focus();
        }
    });
};
const handleDeleteTag = (index: number) => {
    state.proxySelected = undefined;
    state.selectedItems.splice(index, 1);
};
const handleDeleteButtonClick = () => {
    state.proxySelected = undefined;
    state.selectedItems = [];
    emit('click-delete');
};

const hideMenu = () => {
    state.proxyVisibleMenu = false;
};
onClickOutside(containerRef, hideMenu);

/* Watcher */
watch(() => state.proxySelected, (proxySelected) => {
    if (proxySelected === undefined || null) return;

    if (!props.items) {
        state.selectedItems = [];
        return;
    }

    let item;
    if ((props.appearanceType === APPEARANCE_TYPE.BADGE) || (props.appearanceType === APPEARANCE_TYPE.STACK)) {
        if (props.indexMode) {
            item = props.items[proxySelected ?? 0];
            return;
        }
        item = props.items.filter((i) => i.name === proxySelected)[0];

        state.selectedItems.push(item);
        return;
    }

    if (props.indexMode) {
        item = props.items[proxySelected ?? 0];
        state.selectedItems = [item];
        return;
    }

    const data = groupBy(props.items, 'name')[proxySelected ?? ''];
    if (Array.isArray(data)) {
        state.selectedItems = data;
    }
}, { immediate: true });
</script>

<template>
    <div ref="containerRef"
         class="p-select-dropdown"
         :class="{
             [props.styleType] : true,
             [props.appearanceType]: true,
             invalid: props.invalid,
             disabled: props.disabled,
             active: state.proxyVisibleMenu && !props.readOnly,
             'read-only': props.readOnly,
             'is-fixed-width': props.isFixedWidth,
             'highlight-selection-state': props.highlightSelectionState,
             'selected': state.selectedItems.length > 0,
         }"
    >
        <p-i v-if="props.styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON"
             ref="targetRef"
             :name="props.buttonIcon || (state.proxyVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down')"
             :activated="state.proxyVisibleMenu"
             :disabled="props.disabled"
             color="inherit"
             class="only-icon-button"
             style-type="tertiary"
             @click="handleClick"
             @keydown.down="handlePressDownKey"
        />
        <button v-else
                ref="targetRef"
                class="dropdown-button"
                :class="{'text-only': (props.styleType === SELECT_DROPDOWN_STYLE_TYPE.TRANSPARENT && props.readOnly)}"
                @click="handleClick"
                @keydown.down="handlePressDownKey"
        >
            <span class="text"
                  :class="{placeholder: state.selectedItems.length === 0}"
            >
                <slot name="default"
                      v-bind="{item: state.selectedItems}"
                >
                    <strong v-if="props.innerLabel !== undefined && state.selectedItems.length > 0">
                        {{ props.innerLabel || 'Label' }}:
                    </strong>
                    <span v-if="props.appearanceType === APPEARANCE_TYPE.STACK && state.selectedItems.length > 0"
                          class="tags-wrapper"
                    >
                        <p-tag v-for="(selectedItem, index) in state.selectedItems"
                               :key="index"
                               class="stack-tag"
                               :value-item="selectedItem"
                               @delete="handleDeleteTag(index)"
                        />
                    </span>
                    <span v-else>
                        {{ state.innerText }}
                    </span>
                </slot>
            </span>
            <p-badge v-if="props.appearanceType === APPEARANCE_TYPE.BADGE && state.selectedItems.length > 1"
                     badge-type="subtle"
                     style-type="blue300"
                     class="appearance-badge"
            >
                + {{ state.selectedItems.length - 1 }}
            </p-badge>
            <p-i v-if="props.deleteButton && state.selectedItems.length > 0"
                 name="ic_close"
                 color="inherit"
                 class="delete-button"
                 style-type="tertiary"
                 width="1rem"
                 height="1rem"
                 @click.stop="handleDeleteButtonClick"
            />
            <p-i v-if="!(props.styleType === SELECT_DROPDOWN_STYLE_TYPE.TRANSPARENT && props.readOnly)"
                 :name="state.proxyVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                 :activated="state.proxyVisibleMenu"
                 :disabled="props.disabled"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="state.proxyVisibleMenu"
                        ref="contextMenuRef"
                        :class="{ [props.menuPosition]: !props.useFixedMenuStyle }"
                        :menu="props.items"
                        :loading="props.loading"
                        :invalid="props.invalid"
                        :style="{
                            ...contextMenuStyle,
                            ...(props.styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON && {width: 'auto'}),
                        }"
                        item-height-fixed
                        no-select-indication
                        @select="onSelectMenu"
        >
            <template v-for="(_, slot) of state.menuSlots"
                      #[slot]="scope"
            >
                <slot :name="`menu-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-context-menu>
    </div>
</template>

<style lang="postcss">
@define-mixin disabled-style {
    .dropdown-button {
        @apply bg-gray-100 text-gray-300;
    }
}

@define-mixin disabled-style-filled-bg {
    .dropdown-button {
        @apply bg-gray-200 text-gray-400 border-none;
    }
}

@define-mixin read-only-style {
    .dropdown-button {
        @apply border border-solid border-gray-300 text-gray-900 bg-white;
    }
}

.p-select-dropdown {
    @apply relative inline-block rounded-md;
    min-width: 6.5rem;

    .dropdown-button {
        @apply flex justify-between items-center font-normal text-left border border-solid rounded-md;
        width: 100%;
        min-height: 2rem;
        padding: 0 0.5rem;
        margin-right: -1px;
        font-size: 0.875rem;
        gap: 0.25rem;

        .text {
            flex-grow: 1;
            flex-shrink: 0;
            line-height: 1.5;
            .inner-label {
                @apply text-label-md font-bold;
            }
            &.placeholder {
                @apply text-gray-500;
            }
        }
        .delete-button {
            @apply text-gray-400;
        }
        .dropdown-icon {
            @apply text-gray-600;
            flex-shrink: 0;
        }
    }

    /* Style Type */
    &.default {
        .dropdown-button {
            @apply bg-white text-gray-900 border-gray-300;
        }
    }
    &.rounded {
        .dropdown-button {
            @apply rounded-xl border-gray-200;
        }
        &.selected {
            .dropdown-button {
                @apply border-gray-400;
            }
        }
    }
    &.transparent {
        min-width: unset;
        .dropdown-button {
            @apply border-transparent bg-transparent text-gray-900;
            padding-left: 0;
        }
    }
    &.icon-button {
        @apply flex items-center justify-center rounded-full;
        width: 1.5rem;
        height: 1.5rem;
        min-width: unset;
        margin: auto;
        &.disabled {
            @apply cursor-not-allowed;
        }
        .p-context-menu {
            top: 2rem;
        }
    }

    /* Appearance Type */
    &.badge {
        display: flex;
        .appearance-badge {
            @apply text-paragraph-sm;
        }
    }
    &.stack {
        .tags-wrapper {
            flex-grow: 1;
            display: flex;
            flex-wrap: wrap;
        }
    }

    /* hover */
    &:not(.disabled):not(.read-only):not(.invalid) {
        &:hover {
            &.default {
                .dropdown-button {
                    @apply border-blue-600;
                }
            }
            &.rounded {
                .dropdown-button {
                    @apply bg-gray-100;
                }
            }
            &.transparent {
                .dropdown-icon {
                    @apply text-blue-600;
                }
            }
            &.icon-button {
                .only-icon-button {
                    @apply cursor-pointer;
                }
                &:hover {
                    @apply text-blue-600;
                }
            }
        }
    }

    /* active */
    &:not(.invalid):not(.disabled):not(.read-only).active {
        &.default {
            .dropdown-button {
                @apply border-secondary bg-white;
            }
            .dropdown-icon {
                @apply text-blue-600;
            }
        }
        &.rounded {
            .dropdown-button {
                @apply bg-gray-100;
            }
        }
        &.button {
            .dropdown-button {
                @apply border-secondary text-white bg-secondary;
                .dropdown-icon {
                    transform: rotate(180deg);
                }
            }
        }
        &.transparent {
            .dropdown-icon {
                @apply text-secondary;
            }
        }
        &.icon-button {
            @apply bg-blue-300 text-secondary;
            .context-menu {
                margin-top: 0.5rem;
            }
        }
        &.highlight-selection-state {
            .dropdown-button {
                @apply bg-blue-100;
            }
        }
    }

    /* selected */
    &.selected {
        .dropdown-button {
            @apply font-medium;
        }
    }

    /* disabled */
    &.disabled {
        @apply text-gray-300;
        .dropdown-button {
            @apply bg-gray-100 text-gray-300 cursor-not-allowed;
        }
        .dropdown-icon {
            @apply text-gray-300;
        }
        &.transparent {
            .dropdown-button {
                @apply bg-transparent;
            }
        }
    }

    /* read only */
    &.read-only {
        .dropdown-button {
            @apply border border-solid bg-white cursor-default;
            &:focus {
                color: inherit;
            }
            .dropdown-icon {
                @apply text-gray-300;
            }
        }
        &.icon-button {
            display: none;
        }
    }

    /* invalid */
    &:not(.disabled):not(.read-only).invalid {
        &.default, &.rounded {
            .dropdown-button {
                @apply border border-alert;
            }
            &.active {
                .dropdown-button {
                    @apply bg-red-100 ;
                }
            }
            &:hover {
                .dropdown-button {
                    @apply bg-red-100 ;
                }
            }
        }
        &.transparent {
            .dropdown-button {
                @apply border-none;
            }
        }
    }

    /* highlight selection state */
    &.highlight-selection-state {
        &.rounded, &.default {
            .dropdown-button {
                @apply bg-blue-100 border-blue-300 text-blue-600;
                .text {
                    @apply text-blue-600;
                }
                .dropdown-icon {
                    @apply text-blue-600;
                }
            }
            &:not(.disabled):not(.read-only):not(.invalid),
            &:not(.invalid):not(.disabled):not(.read-only).active {
                .dropdown-button {
                    @apply bg-blue-100;
                }
            }
        }
    }

    /* is-fixed-width */
    &.is-fixed-width {
        display: initial;
        .dropdown-button {
            .text {
                @apply truncate;
                flex: 1;
            }
            &.text-only {
                .text {
                    width: 100%;
                }
            }
        }
    }

    &.none {
        display: none;
    }

    .p-context-menu {
        @apply absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: auto;
        &.left {
            right: unset;
        }
        &.right {
            left: unset;
            right: -1px;
        }
    }
}
</style>
