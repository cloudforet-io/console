<template>
    <div ref="containerRef"
         class="p-select-dropdown"
         :class="{
             [styleType] : true,
             invalid,
             disabled,
             'read-only': readOnly,
             active: state.proxyVisibleMenu && !readOnly,
             [size] : true,
             'is-fixed-width': isFixedWidth,
         }"
    >
        <p-icon-button v-if="styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON"
                       ref="targetRef"
                       :name="buttonIcon || (state.proxyVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down')"
                       :activated="state.proxyVisibleMenu"
                       :disabled="disabled"
                       color="inherit"
                       class="icon-button"
                       @click="handleClick"
                       @keydown.down="handlePressDownKey"
        />
        <button v-else
                ref="targetRef"
                class="dropdown-button"
                :class="{'text-only': (styleType === SELECT_DROPDOWN_STYLE_TYPE.TRANSPARENT && readOnly)}"
                @click="handleClick"
                @keydown.down="handlePressDownKey"
        >
            <span class="text"
                  :class="{placeholder: !state.selectedItem}"
            >
                <slot name="default"
                      v-bind="{item: state.selectedItem}"
                >
                    {{
                        state.selectedItem ?
                            (state.selectedItem.label || state.selectedItem.name || '') :
                            (placeholder || $t('COMPONENT.SELECT_DROPDOWN.SELECT'))
                    }}
                </slot>
            </span>
            <p-i v-if="!(styleType === SELECT_DROPDOWN_STYLE_TYPE.TRANSPARENT && readOnly)"
                 :name="state.proxyVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                 :activated="state.proxyVisibleMenu"
                 :disabled="disabled"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="state.proxyVisibleMenu"
                        ref="contextMenuRef"
                        :class="{ [menuPosition]: !useFixedMenuStyle }"
                        :menu="items"
                        :loading="loading"
                        :invalid="invalid"
                        :style="{
                            ...contextMenuStyle,
                            ...(styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON && {width: 'auto'}),
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

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { groupBy, reduce } from 'lodash';
import {
    computed, ref, reactive,
    nextTick, toRef, useSlots,
} from 'vue';
import type { PropType } from 'vue';



import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type { SelectDropdownSize } from '@/inputs/dropdown/select-dropdown/type';
import {
    SELECT_DROPDOWN_STYLE_TYPE,
    CONTEXT_MENU_POSITION, SELECT_DROPDOWN_SIZE,
} from '@/inputs/dropdown/select-dropdown/type';

const props = defineProps({
    /* context menu fixed style props */
    useFixedMenuStyle: {
        type: Boolean,
        default: false,
    },
    visibleMenu: {
        type: Boolean,
        default: undefined,
    },
    /* context menu props */
    invalid: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    /* select dropdown props */
    items: {
        type: Array,
        default: () => [],
    },
    selected: {
        type: [String, Number],
        default: undefined,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    indexMode: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: '',
    },
    styleType: {
        type: String,
        default: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
        validator: (value: SELECT_DROPDOWN_STYLE_TYPE) => Object.values(SELECT_DROPDOWN_STYLE_TYPE).includes(value),
    },
    buttonIcon: {
        type: String,
        default: undefined,
    },
    menuPosition: {
        type: String,
        default: CONTEXT_MENU_POSITION.LEFT,
        validator: (value: CONTEXT_MENU_POSITION) => Object.values(CONTEXT_MENU_POSITION).includes(value),
    },
    readOnly: {
        type: Boolean,
        default: false,
    },
    size: {
        type: String as PropType<SelectDropdownSize>,
        default: SELECT_DROPDOWN_SIZE.md,
        validator(size: SelectDropdownSize) {
            return Object.values(SELECT_DROPDOWN_SIZE).includes(size);
        },
        /* fixed width props */
        isFixedWidth: {
            type: Boolean,
            default: false,
        },
    },
});
const emit = defineEmits(['update:selected', 'select', 'update:visibleMenu', 'focus-menu']);
const slots = useSlots();

const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean | undefined>('visibleMenu', props, emit),
    contextMenuRef: null as null|any,
    proxySelected: useProxyValue('selected', props, emit),
    selectedItem: computed<MenuItem|null>(() => {
        if (!Array.isArray(props.items)) return null;

        if (props.indexMode) return props.items[state.proxySelected ?? ''] || null;

        const data = groupBy(props.items, 'name')[state.proxySelected ?? ''];
        if (Array.isArray(data)) return data[0] || null;

        return null;
    }),
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
const onSelectMenu = (item: MenuItem, index, event) => {
    if (props.indexMode) {
        emit('select', index, event);
        state.proxySelected = index;
    } else {
        emit('select', item.name, event);
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
        if (state.contextMenuRef) {
            if (slots['menu-menu']) emit('focus-menu');
            else state.contextMenuRef.focus();
        }
    });
};

const hideMenu = () => {
    state.proxyVisibleMenu = false;
};
onClickOutside(containerRef, hideMenu);

</script>

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
    @apply rounded-md;
    position: relative;
    display: inline-block;
    min-width: 6.5rem;

    &.icon-button {
        min-width: unset;
    }

    .dropdown-button {
        @apply border border-solid border-gray-300 rounded-md;
        min-width: unset;
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.25rem 0 0.5rem;
        margin-right: -1px;
        font-weight: normal;
        font-size: 0.875rem;
        text-align: left;
        height: 2rem;

        .text {
            flex-grow: 1;
            flex-shrink: 0;
            padding: 0.25rem 0;
            line-height: 1.5;
            height: 100%;
            &.placeholder {
                @apply text-gray-600;
            }
        }
        .dropdown-icon {
            flex-shrink: 0;
        }

        &:focus, &:active {
            @apply border-secondary text-secondary;
            outline: none;
        }
    }

    &.default {
        .dropdown-button {
            @apply bg-white text-gray-900 border-gray-300;
        }
    }
    &.secondary-button {
        .dropdown-button {
            @apply text-violet-800 border-violet-800;
        }
    }
    &.transparent {
        .dropdown-button {
            @apply border-transparent bg-transparent text-gray-900;
            padding-left: 0;
        }
    }

    /* read only */
    &.read-only {
        .dropdown-button {
            cursor: default;
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
        &.secondary-button {
            @mixin read-only-style;
        }
    }

    /* is-fixed-width */
    &.is-fixed-width {
        .dropdown-button {
            .text {
                @apply truncate;
                width: calc(100% - 1.5rem);
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
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: auto;
        &.left {
            left: 0;
            right: unset;
        }
        &.right {
            left: unset;
            right: 0;
        }
    }

    /* disabled */
    &.disabled {
        @mixin disabled-style;
        .dropdown-button {
            cursor: not-allowed;
        }
        &.transparent {
            .dropdown-button {
                @apply bg-transparent;
            }
        }
        &.secondary-button {
            @mixin disabled-style-filled-bg;
        }
    }

    /* invalid */
    &:not(.disabled):not(.read-only).invalid {
        .dropdown-button {
            @apply border border-alert;
            &:focus, &:active {
                @apply border border-alert;
            }
        }
    }

    /* active */
    &:not(.invalid):not(.disabled):not(.read-only).active {
        &.default {
            .dropdown-button {
                @apply border-secondary text-secondary bg-white;
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
            .dropdown-button {
                @apply text-secondary;
            }
        }
        &.secondary-button {
            .dropdown-button {
                @apply border-secondary text-secondary bg-white;
            }
        }
    }

    /* hover */
    &:not(.invalid):not(.disabled):not(.active):not(.read-only) {
        &.default {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply border-blue-600;
                        .dropdown-icon {
                            @apply text-blue-600;
                        }
                    }
                }
            }
        }
        &.transparent {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply text-secondary;
                        outline: none;
                    }
                }
            }
        }
        &.secondary-button {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply bg-white text-secondary border-secondary;
                    }
                }
            }
        }
    }

    &:not(.disabled):not(.active).transparent {
        &.default {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply text-secondary;
                    }
                }
            }
        }
    }

    /* size */
    &.lg {
        .dropdown-button {
            font-size: 1rem;
        }
    }
    &.md {
        .dropdown-button {
            font-size: 0.875rem;
        }
    }
}
</style>
