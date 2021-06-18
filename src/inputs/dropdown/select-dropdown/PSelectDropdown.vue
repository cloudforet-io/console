<template>
    <div v-click-outside="onClickOutside" class="p-select-dropdown">
        <p-button ref="targetRef"
                  :disabled="disabled"
                  :tabindex="-1"
                  class="dropdown-button"
                  :class="{'button-only': buttonOnly, invalid, disabled, active: proxyVisibleMenu}"
                  :style-type="buttonStyleType"
                  @click="onClick"
                  @keydown.down="onPressDownKey"
        >
            <slot name="default">
                {{ selectItemLabel }}
            </slot>
            <p-i :name="buttonIcon || (proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom')"
                 color="inherit"
            />
        </p-button>
        <p-context-menu v-if="proxyVisibleMenu"
                        ref="contextMenuRef"
                        :class="{invalid}"
                        :menu="items"
                        :loading="loading"
                        :always-show-menu="alwaysShowMenu"
                        :style="contextMenuStyle"
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

import { SelectDropdownProps } from '@/inputs/dropdown/select-dropdown/type';
import { ICON_BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuCustomStyle } from '@/hooks/context-menu-custom-style';

export default defineComponent({
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
        prop: 'selectItem',
        event: 'select',
    },
    props: {
        /* context menu custom style props */
        useFixedMenuStyle: {
            type: Boolean,
            default: false,
        },
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        /* select dropdown props */
        items: {
            type: Array,
            default: () => [],
        },
        selectItem: {
            type: [String, Number],
            default: '',
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
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
                return Object.keys(ICON_BUTTON_STYLE_TYPE).includes(value);
            },
        },
        buttonIcon: {
            type: String,
            default: undefined,
        },
        alwaysShowMenu: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: SelectDropdownProps, { emit, slots }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const { state: contextMenuCustomStyleState } = useContextMenuCustomStyle(props);

        const state = reactive({
            contextMenuRef: null as null|any,
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

        const selectItemLabel = computed(() => {
            if (!Array.isArray(props.items)) return props.placeholder;

            if (props.indexMode) {
                if (props.items[props.selectItem ?? '']) {
                    return props.items[props.selectItem ?? '']?.label || props.items[props.selectItem ?? '']?.name || '';
                }
                return props.placeholder;
            }

            const data = groupBy(props.items, 'name')[props.selectItem ?? ''];
            if (Array.isArray(data)) {
                return data[0]?.label || data[0]?.name || '';
            }
            return props.placeholder;
        });

        /* event */
        const onSelectMenu = (value, index) => {
            if (props.indexMode) {
                emit('input', index);
                emit('select', index);
                emit('onSelected', index); // todo: deprecated
            } else {
                emit('input', value);
                emit('select', value);
                emit('onSelected', value); // todo: deprecated
            }
            contextMenuCustomStyleState.proxyVisibleMenu = false;
        };
        const onClick = () => {
            contextMenuCustomStyleState.proxyVisibleMenu = !contextMenuCustomStyleState.proxyVisibleMenu;
        };
        const onClickOutside = (): void => {
            contextMenuCustomStyleState.proxyVisibleMenu = false;
        };
        const onPressDownKey = () => {
            if (!contextMenuCustomStyleState.proxyVisibleMenu) contextMenuCustomStyleState.proxyVisibleMenu = true;
            vm.$nextTick(() => {
                if (state.contextMenuRef) {
                    if (slots['menu-menu']) emit('focus-menu');
                    else state.contextMenuRef.focus();
                }
            });
        };

        return {
            ...toRefs(state),
            ...toRefs(contextMenuCustomStyleState),
            selectItemLabel,
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
    min-width: 6.5rem;

    .dropdown-button {
        @apply border-gray-300 text-gray-900 rounded;
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        flex-grow: 1;
        padding: 0 0.25rem 0 0.5rem;
        margin-right: -1px;
        font-weight: normal;
        text-align: left;

        &.button-only {
            min-width: unset;
        }
        &.disabled {
            @apply bg-gray-100 text-gray-400;
        }
        &:not(.disabled).invalid {
            @apply border border-alert;
        }
        &:not(.invalid):not(.disabled).active {
            @apply border-secondary text-secondary;
        }
        &:not(.invalid):not(.disabled):not(.active) {
            @media (hover: hover) {
                &:not(.active):not(.disabled):hover {
                    @apply border-gray-900;
                }
            }
        }
    }
    .p-context-menu.secondary.invalid {
        @apply border border-alert;
    }
}
</style>
