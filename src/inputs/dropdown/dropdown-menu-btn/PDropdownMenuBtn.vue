<template>
    <div v-click-outside="onClickOutside" class="p-dropdown-menu-button">
        <div ref="dropdownBtn" class="p-dropdown-button" :class="{'button-only': buttonOnly}">
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
                <slot name="default" />
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
                        :menu="menu"
                        :loading="loading"
                        :auto-height="autoHeight"
                        :use-custom-style="useCustomStyle"
                        :position="position"
                        :offset-top="offsetTop"
                        :width="width"
                        :height="height"
                        @select="clickMenuEvent"
        >
            <template v-for="(_, slot) of menuSlots" v-slot:[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="scope" />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import { reduce } from 'lodash';
import vClickOutside from 'v-click-outside';

import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';

import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { ICON_BUTTON_STYLE_TYPE } from '@/inputs/buttons/icon-button/type';
import { DropdownMenuButtonProps } from '@/inputs/dropdown/dropdown-menu-btn/type';

import { makeProxy } from '@/util/composition-helpers';

export default defineComponent({
    name: 'PDropdownMenuBtn',
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: {
        PIconButton,
        PButton,
        PContextMenu,
    },
    props: {
        menu: {
            type: [Array, Object],
            default: () => [],
        },
        loading: {
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
        buttonOnly: {
            type: Boolean,
            default: false,
        },
        buttonIcon: {
            type: String,
            default: undefined,
        },
        buttonStyleType: {
            type: String,
            default: undefined,
            validator: (value) => {
                if (value === undefined) return true;
                return Object.keys(ICON_BUTTON_STYLE_TYPE).includes(value as any);
            },
        },
        useCustomStyle: {
            type: Boolean,
            default: false,
        },
        showPopup: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: DropdownMenuButtonProps, { emit, slots }) {
        const state = reactive({
            dropdownBtn: null as HTMLElement | null,
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
            proxyShowPopup: makeProxy('showPopup', props, emit),
            mouseover: false,
        });

        const setCustomStyle = () => {
            if (state.dropdownBtn) {
                const winHeight = window.innerHeight;
                const rects: any = state.dropdownBtn?.getBoundingClientRect();
                let position = 'bottom';
                if (winHeight * 0.9 > rects.top) position = 'top';

                state.position = position;
                state.offsetTop = rects.top;
                state.width = rects.width;
                state.height = rects.height;
            }
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

        const clickMenuEvent = (menuName: string, idx: number) => {
            emit('select', menuName, idx);
            emit(`${menuName}:select`, menuName, idx);
            emit(`click-${menuName}`, idx);
            state.popup = false;
        };

        watch(() => props.showPopup, (after, before) => {
            if (after) state.popup = false;
            else state.proxyShowPopup = false;
        });

        return {
            ...toRefs(state),
            onClickOutside,
            clickMenuEvent,
            onClick,
            onMouseOver,
            onMouseOut,
            setCustomStyle,
        };
    },
});
</script>

<style lang="postcss">
.p-dropdown-menu-button {
    position: relative;

    .p-context-menu {
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
    }

    .p-dropdown-button {
        display: inline-flex;
        min-width: 6.5rem;
        &.button-only {
            min-width: unset;
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
