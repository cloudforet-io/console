<template>
    <div v-click-outside="onClickOutside" class="p-select-dropdown"
         :class="{'button-only': buttonOnly, invalid, disabled, active: proxyVisibleMenu}"
    >
        <p-button ref="targetRef"
                  :disabled="disabled"
                  :tabindex="-1"
                  class="dropdown-button"
                  :style-type="buttonStyleType"
                  @click="onClick"
                  @keydown.down="onPressDownKey"
        >
            <span v-if="!buttonOnly" class="text" :class="{placeholder: !$scopedSlots.default && !selectedItem}">
                <slot name="default">
                    {{
                        selectedItem ?
                            (selectedItem.label || selectedItem.name || '') :
                            (placeholder || $t('COMPONENT.SELECT_DROPDOWN.SELECT'))
                    }}
                </slot>
            </span>
            <p-i :name="buttonIcon || (proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom')"
                 color="inherit"
                 class="dropdown-icon"
            />
        </p-button>
        <p-context-menu v-if="proxyVisibleMenu"
                        ref="contextMenuRef"
                        :menu="items"
                        :loading="loading"
                        :always-show-menu="alwaysShowMenu"
                        :invalid="invalid"
                        :style="{
                            ...contextMenuStyle,
                            ...(buttonOnly && {width: 'auto'})
                        }"
                        @select="onSelectMenu"
        >
            <template v-for="(_, slot) of menuSlots" v-slot:[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="scope" />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import { groupBy, reduce } from 'lodash';
import vClickOutside from 'v-click-outside';

import {
    computed, toRefs, reactive, defineComponent, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PI from '@/foundation/icons/PI.vue';

import { useContextMenuFixedStyle, ContextMenuFixedStyleProps } from '@/hooks/context-menu-fixed-style';

import { MenuItem } from '@/inputs/context-menu/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';
import { makeOptionalProxy } from '@/util/composition-helpers';


interface SelectDropdownProps extends ContextMenuFixedStyleProps {
    items?: MenuItem[];
    selected?: string | number;
    invalid?: boolean;
    disabled?: boolean;
    loading?: boolean;
    alwaysShowMenu?: boolean;
    indexMode?: boolean;
    placeholder?: string;
    buttonOnly?: boolean;
    buttonStyleType?: BUTTON_STYLE;
    buttonIcon?: string;
}

export default defineComponent<SelectDropdownProps>({
    name: 'PSelectDropdown',
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: {
        PI,
        PButton,
        PContextMenu,
    },
    model: {
        prop: 'selected',
        event: 'update:selected',
    },
    props: {
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
        alwaysShowMenu: {
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
        buttonOnly: {
            type: Boolean,
            default: false,
        },
        buttonStyleType: {
            type: String,
            default: undefined,
            validator: (value: any) => {
                if (value === undefined) return true;
                return Object.values(BUTTON_STYLE).includes(value);
            },
        },
        buttonIcon: {
            type: String,
            default: undefined,
        },
    },
    setup(props: SelectDropdownProps, { emit, slots }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const { state: contextMenuFixedStyleState } = useContextMenuFixedStyle(props);

        const state = reactive({
            contextMenuRef: null as null|any,
            proxySelected: makeOptionalProxy('selected', vm, props.selected),
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


        /* Event Handlers */
        const onSelectMenu = (value, index) => {
            if (props.indexMode) {
                emit('select', index);
                state.proxySelected = index;
            } else {
                emit('select', value);
                state.proxySelected = value;
            }
            contextMenuFixedStyleState.proxyVisibleMenu = false;
        };
        const onClick = () => {
            contextMenuFixedStyleState.proxyVisibleMenu = !contextMenuFixedStyleState.proxyVisibleMenu;
        };
        const onClickOutside = (): void => {
            contextMenuFixedStyleState.proxyVisibleMenu = false;
        };
        const onPressDownKey = () => {
            if (!contextMenuFixedStyleState.proxyVisibleMenu) contextMenuFixedStyleState.proxyVisibleMenu = true;
            vm.$nextTick(() => {
                if (state.contextMenuRef) {
                    if (slots['menu-menu']) emit('focus-menu');
                    else state.contextMenuRef.focus();
                }
            });
        };

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            onClickOutside,
            onSelectMenu,
            onClick,
            onPressDownKey,
        };
    },
});
</script>

<style lang="postcss">
.p-select-dropdown {
    position: relative;
    display: inline-block;
    min-width: 6.5rem;
    .dropdown-button {
        @apply border-gray-300 text-gray-900 rounded;
        min-width: unset;
        width: 100%;
        display: inline-flex;
        justify-content: space-between;

        padding: 0 0.25rem 0 0.5rem;
        margin-right: -1px;
        font-weight: normal;
        text-align: left;

        .text {
            flex-grow: 1;
            flex-shrink: 0;
            &.placeholder {
                @apply text-gray-300;
            }
        }
        .dropdown-icon {
            flex-shrink: 0;
        }
    }
    .p-context-menu {
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: auto;
    }

    &.button-only {
        min-width: unset;
        .dropdown-button {
            padding: 0.25rem;
        }
    }
    &.disabled {
        .dropdown-button {
            @apply bg-gray-100 text-gray-400;
        }
    }
    &:not(.disabled).invalid {
        .dropdown-button {
            @apply border border-alert;
        }
    }
    &:not(.invalid):not(.disabled).active {
        .dropdown-button {
            @apply border-secondary text-secondary;
        }
    }
    &:not(.invalid):not(.disabled):not(.active) {
        .dropdown-button {
            @media (hover: hover) {
                &:not(.active):not(.disabled):hover {
                    @apply border-gray-900;
                }
            }
        }
    }
}
</style>
