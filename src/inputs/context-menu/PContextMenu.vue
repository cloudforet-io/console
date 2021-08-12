<template>
    <div class="p-context-menu"
         :class="{[theme]: true, invalid}"
         @keyup.esc="onClickEsc"
    >
        <div v-if="!alwaysShowMenu && menu.length === 0" class="context-item empty" :class="theme">
            <slot name="no-data-format" v-bind="{...$props, uuid}">
                {{ $t('COMPONENT.CONTEXT_MENU.NO_ITEM') }}
            </slot>
        </div>
        <slot v-else name="menu" v-bind="{...$props, uuid}">
            <div v-if="multiSelectable && showSelectedList" class="selected-list-wrapper">
                <div>
                    <b>{{ $t('COMPONENT.CONTEXT_MENU.SELECTED_LIST') }}</b> <span>({{ proxySelected.length }} / {{ menu.length }})</span>
                </div>
                <p-button size="sm" style-type="primary-dark" :disabled="!proxySelected.length">
                    {{ $t('COMPONENT.CONTEXT_MENU.DONE') }}
                </p-button>
            </div>
            <a v-if="multiSelectable && showSelectAll" class="context-item" @click="onClickSelectAll">
                <p-i :name="isAllSelected ? 'ic_checkbox--checked' : 'ic_checkbox'"
                     class="select-marker"
                />
                <span class="text italic">{{ $t('COMPONENT.CONTEXT_MENU.SELECT_ALL') }}</span>
            </a>
            <template v-for="(item, index) in menu">
                <a v-if="item.type === undefined || item.type === 'item'"
                   :id="`context-item-${index}-${uuid}`"
                   :key="`${item.name}-${index}`"
                   :tabindex="index"
                   class="context-item"
                   :class="{ disabled: item.disabled, [theme]: true }"
                   :href="item.disabled ? undefined : item.link"
                   :target="item.target"
                   @click.stop="onClickMenu(item.name, index, $event)"
                   @keyup.enter="onClickMenu(item.name, index, $event)"
                   @keydown.up="onKeyUp(index)"
                   @keydown.down="onKeyDown(index)"
                >
                    <p-i v-if="showRadioIcon && !multiSelectable"
                         :name="proxySelected.includes(item.name) ? 'ic_radio--checked' : 'ic_radio'"
                         class="select-marker"
                    />
                    <p-i v-if="multiSelectable"
                         :name="proxySelected.includes(item.name) ? 'ic_checkbox--checked' : 'ic_checkbox'"
                         class="select-marker"
                    />
                    <slot name="item--format" v-bind="{...$props, uuid, item, index}">
                        <span class="text" :class="{'with-icon': item.target === '_blank'}">
                            {{ item.label }}
                        </span>
                        <p-i v-if="item.target === '_blank'" class="external-link-icon" name="ic_external-link"
                             width="0.875rem" height="0.875rem"
                        />
                    </slot>
                </a>
                <div v-else-if="item.type==='divider'" :key="index" class="context-divider" />
                <slot v-else-if="item.type==='header'" :name="`header-${item.name}`" v-bind="{...$props, uuid, item, key: index}">
                    <div :key="index" class="context-header" :class="theme">
                        {{ item.label }}
                    </div>
                </slot>
            </template>
        </slot>

        <div v-if="loading" class="loader">
            <p-lottie name="thin-spinner" auto :size="1" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import PLottie from '@/foundation/lottie/PLottie.vue';
import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';

import { ContextMenuProps, CONTEXT_MENU_THEME } from '@/inputs/context-menu/type';
import { i18n } from '@/translations';
import { makeOptionalProxy } from '@/util/composition-helpers';


export default defineComponent<ContextMenuProps>({
    name: 'PContextMenu',
    components: {
        PLottie,
        PI,
        PButton,
    },
    i18n,
    props: {
        menu: {
            type: Array,
            default: () => [],
        },
        theme: {
            type: String,
            default: 'secondary',
            validator(theme: any) {
                return Object.values(CONTEXT_MENU_THEME).includes(theme);
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        alwaysShowMenu: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Array,
            default: () => [],
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
        showRadioIcon: {
            type: Boolean,
            default: false,
        },
        showSelectedList: {
            type: Boolean,
            default: false,
        },
        showSelectAll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ContextMenuProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxySelected: makeOptionalProxy('selected', vm, props.selected),
            isAllSelected: computed(() => {
                const filteredMenu = props.menu.filter(d => !d.disabled);
                return filteredMenu.length === state.proxySelected.length;
            }),
        });

        let focusedItemEl: HTMLElement | null = null;
        const uuid = `${Math.random()}`.slice(2);
        const itemsIndex = computed<number[]>(() => {
            const indices: number[] = [];
            props.menu.forEach((menuItem, i) => {
                if ((!menuItem.type || menuItem.type === 'item') && !menuItem.disabled) {
                    indices.push(i);
                }
            });
            return indices;
        });

        /* util */
        const focus = (position) => {
            const idx = position === -1 ? itemsIndex.value[itemsIndex.value.length - 1] : itemsIndex.value[position || 0];
            const el = document.getElementById(`context-item-${idx}-${uuid}`);
            if (el) {
                el.focus();
                focusedItemEl = el;
                emit('focus', idx);
            }
        };
        const blur = () => {
            if (focusedItemEl) {
                focusedItemEl.blur();
                focusedItemEl = null;
            }
            emit('blur');
        };

        /* event */
        const onKeyUp = (idx: number) => {
            const pos = itemsIndex.value.indexOf(idx);
            if (pos !== 0) {
                focus(pos - 1);
            } else {
                emit('keyup:up:end');
                blur();
            }
        };
        const onKeyDown = (idx) => {
            const pos = itemsIndex.value.indexOf(idx) + 1;
            if (pos !== itemsIndex.value.length) {
                focus(pos);
            } else {
                emit('keyup:down:end');
                blur();
            }
        };
        const onClickMenu = (itemName, index, event) => {
            if (!props.menu[index].disabled) {
                emit(`${itemName}:select`, index, event);
                emit('select', itemName, index);

                if (props.multiSelectable) {
                    if (state.proxySelected.includes(itemName)) {
                        const indexOfSelectedList = state.proxySelected.indexOf(itemName);
                        state.proxySelected.splice(indexOfSelectedList, 1);
                    } else {
                        state.proxySelected.push(itemName);
                    }
                } else {
                    state.proxySelected = [itemName];
                }
            }
        };
        const onClickEsc = (e) => {
            emit('keyup:esc', e);
            blur();
        };
        const onClickSelectAll = () => {
            if (state.isAllSelected) {
                state.proxySelected = [];
            } else {
                const filteredMenu = props.menu.filter(d => !d.disabled);
                state.proxySelected = filteredMenu.map(d => d.name);
            }
        };

        return {
            ...toRefs(state),
            uuid,
            onClickMenu,
            onKeyDown,
            onKeyUp,
            focus,
            onClickEsc,
            onClickSelectAll,
        };
    },
});
</script>

<style lang="postcss">
.p-context-menu {
    @apply rounded;
    position: relative;
    min-width: 100%;
    text-align: left;
    background-clip: padding-box;
    max-height: 32rem;
    overflow-y: auto;
    border-width: 1px;
    border-style: solid;
    user-select: none;

    &.invalid {
        @apply border-alert;
    }

    .selected-list-wrapper {
        @apply border-b border-gray-200;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0.5rem;
        padding-bottom: 0.5rem;
    }
    .context-header {
        margin-top: 0.875rem;
        margin-bottom: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-weight: bold;
        font-size: 0.75rem;
        line-height: 1.5;
    }
    .context-divider {
        border-top-width: 1px;
        border-top-style: solid;
    }
    .context-item {
        display: flex;
        padding: 0.25rem 0.5rem;
        line-height: 1.6;
        font-size: 0.875rem;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;

        .text {
            @apply truncate;
            flex-shrink: 0;
            flex-grow: 1;
            max-width: 100%;
            &.with-icon {
                max-width: calc(100% - 0.25rem - 0.875rem);
            }
        }
        .external-link-icon {
            flex-shrink: 0;
            margin-left: 0.25rem;
        }
        .select-marker {
            margin-right: 0.25rem;
        }
    }

    .loader {
        @apply absolute w-full h-full flex items-center justify-center;
        left: 0;
        top: 0;
        background-color: rgba(theme('colors.white'), 0.5);
    }

    /* themes */
    @define-mixin context-menu-theme $bg-color, $border-color, $header-color,
        $color, $hover-bg-color, $hover-color,
        $active-bg-color, $active-color, $disabled-color {
        background-color: $bg-color;

        &:not(.invalid) {
            border-color: $border-color;
        }

        .context-divider {
            border-top-color: $border-color;
        }

        .context-header {
            color: $header-color;
        }

        .context-item {
            color: $color;
            &:not(.disabled):not(.empty) {
                &:hover, &:focus {
                    background-color: $hover-bg-color;
                    color: $hover-color;
                }
            }
            &:not(.disabled):not(.empty):not(:hover):not(:focus):active {
                background-color: $active-bg-color;
                color: $active-color;
            }
            &.disabled {
                color: $disabled-color;
                cursor: not-allowed;
            }
            &.empty {
                color: $disabled-color;
                cursor: default;
            }
        }
    }

    &.secondary {
        @mixin context-menu-theme theme('colors.white'), theme('colors.secondary'), theme('colors.secondary'),
            theme('colors.gray.900'), theme('colors.blue.200'), theme('colors.gray.900'),
            theme('colors.secondary2'), theme('colors.secondary'), theme('colors.gray.300');
    }
    &.gray900 {
        @mixin context-menu-theme theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.400'),
            theme('colors.gray.900'), theme('colors.gray.100'), theme('colors.gray.900'),
            theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.300');
    }
}
</style>
