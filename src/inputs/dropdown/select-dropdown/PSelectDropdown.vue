<template>
    <div v-click-outside="onClickOutside" class="p-select-dropdown">
        <div ref="dropdownButtonRef"
             class="dropdown-button"
             :class="{'button-only': buttonOnly, 'invalid': invalid}"
        >
            <p-button v-if="!buttonOnly"
                      :disabled="disabled"
                      :tabindex="-1"
                      class="menu-button"
                      :class="{active: popup, hovered: mouseover}"
                      :style-type="buttonStyleType"
                      @click="onClick"
                      @mouseover="onMouseOver"
                      @mouseout="onMouseOut"
            >
                <slot name="default">
                    {{ selectItemLabel }}
                </slot>
            </p-button>
            <p-icon-button :name="buttonIcon || (popup ? 'ic_arrow_top' : 'ic_arrow_bottom')"
                           color="inherit transparent"
                           :class="{active: popup, hovered: mouseover}"
                           :style-type="buttonStyleType"
                           :disabled="disabled"
                           :outline="true"
                           shape="square"
                           @click="onClick"
                           @mouseenter="onMouseOver"
                           @mouseleave="onMouseOut"
            />
        </div>
        <p-context-menu v-if="popup"
                        class="menu-ctx"
                        :menu="items"
                        :loading="loading"
                        :auto-height="autoHeight"
                        :use-custom-style="useCustomStyle"
                        :position="position"
                        :offset-top="offsetTop"
                        :width="width"
                        :height="height"
                        :always-show-menu="alwaysShowMenu"
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
    computed, toRefs, watch, reactive,
} from '@vue/composition-api';

import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

import { SelectDropdownProps } from '@/inputs/dropdown/select-dropdown/type';
import { makeProxy } from '@/util/composition-helpers';
import { ICON_BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';

export default {
    name: 'PSelectDropdown',
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: {
        PIconButton,
        PButton,
        PContextMenu,
    },
    model: {
        prop: 'selectItem',
    },
    props: {
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
        autoHeight: {
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
        useCustomStyle: {
            type: Boolean,
            default: false,
        },
        showPopup: {
            type: Boolean,
            default: false,
        },
        buttonOnly: {
            type: Boolean,
            default: false,
        },
        buttonStyleType: {
            type: String,
            default: undefined,
            validator: (value) => {
                if (value === undefined) return true;
                return Object.keys(ICON_BUTTON_STYLE_TYPE).includes(value as any);
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
        const state = reactive({
            proxyShowPopup: makeProxy('showPopup', props, emit),
            dropdownButtonRef: null as HTMLElement | null,
            popup: false,
            width: 0,
            height: 0,
            offsetTop: 0,
            position: null as any,
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
            mouseover: false,
        });
        const selectItemLabel = computed(() => {
            if (props.indexMode) {
                if (props.items[props.selectItem]) return props.items[props.selectItem].label || props.items[props.selectItem].name || '';
                return props.placeholder;
            }
            const data = groupBy(props.items, 'name')[props.selectItem];
            if (Array.isArray(data)) {
                return data[0].label || data[0].name || '';
            }
            return props.placeholder;
        });

        /* util */
        const setCustomStyle = () => {
            if (state.dropdownButtonRef) {
                const winHeight = window.innerHeight;
                const rects: any = state.dropdownButtonRef?.getBoundingClientRect();
                let position = 'bottom';
                if (winHeight * 0.9 > rects.top) position = 'top';

                state.position = position;
                state.offsetTop = rects.top;
                state.width = rects.width;
                state.height = rects.height;
            }
        };

        /* event */
        const onSelectMenu = (value, index) => {
            if (props.indexMode) {
                emit('input', index);
                emit('onSelected', index); // todo: deprecated
            } else {
                emit('input', value);
                emit('onSelected', value); // todo: deprecated
            }
            state.popup = false;
        };
        const onClick = () => {
            state.popup = !state.popup;
            state.proxyShowPopup = false;
            if (props.useCustomStyle) setCustomStyle();
        };
        const onMouseOver = () => {
            if (!props.disabled) state.mouseover = true;
        };
        const onMouseOut = () => {
            if (!props.disabled) state.mouseover = false;
        };
        const onClickOutside = (): void => {
            state.popup = false;
        };

        watch(() => props.showPopup, (showPopup) => {
            if (!showPopup) state.proxyShowPopup = false;
        });

        return {
            ...toRefs(state),
            selectItemLabel,
            onClickOutside,
            onSelectMenu,
            onClick,
            onMouseOver,
            onMouseOut,
            setCustomStyle,
        };
    },
};
</script>

<style lang="postcss">
.p-select-dropdown {
    position: relative;

    .dropdown-button {
        display: inline-flex;
        min-width: 6.5rem;

        &.button-only {
            min-width: unset;
        }
        &.invalid {
            .p-button {
                @apply border border-alert;
            }
            .p-icon-button.p-button, .p-icon-button.p-button.active, .p-icon-button.p-button.hovered {
                @apply border border-alert;
            }
        }

        .menu-button {
            @apply border-gray-300 text-gray-900 px-2 justify-start text-left flex-grow font-normal;
            width: auto;
            min-width: unset;
            margin-right: -1px;
            border-radius: 2px 0 0 2px;
            &:not(.active).hovered {
                @apply border-gray-900;
            }
            &.active {
                @apply border-secondary text-secondary;
            }
            &.disabled {
                @apply bg-gray-100 text-gray-300;
            }
        }

        .p-icon-button.outline {
            @apply flex-shrink-0 border-gray-300;
            &:not(.active).hovered {
                @apply border-gray-900;
            }
            &:not(.disabled):hover {
                border-color: unset;
                background-color: unset;
                color: unset;
            }
            &.disabled {
                @apply text-gray-300;
            }
            &.active {
                @apply border-secondary text-secondary;
                &:hover {
                    @apply border-secondary text-secondary;
                }
            }
        }
    }
}
</style>
