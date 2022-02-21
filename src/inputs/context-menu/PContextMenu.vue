<template>
    <div class="p-context-menu"
         @keyup.esc="onClickEsc"
    >
        <slot v-show="menu.length > 0" name="menu" v-bind="{...$props, uuid}">
            <div v-if="multiSelectable" class="selected-list-wrapper">
                <div>
                    <b>{{ $t('COMPONENT.CONTEXT_MENU.SELECTED_LIST') }}</b>
                    <span class="pl-2">({{ selectedCountInFilteredMenu }} / {{ menuItemLength }})</span>
                </div>
                <p-button size="sm" style-type="primary-dark" :disabled="!proxySelected.length">
                    {{ $t('COMPONENT.CONTEXT_MENU.DONE') }}
                </p-button>
            </div>
            <slot name="help-text" />
            <a v-if="multiSelectable" class="context-item" @click.stop="onClickSelectAll">
                <p-i :name="isAllSelected ? 'ic_checkbox--checked' : 'ic_checkbox'"
                     class="select-marker"
                />
                <b class="text">{{ $t('COMPONENT.CONTEXT_MENU.SELECT_ALL') }}</b>
            </a>
            <template v-for="(item, index) in menu">
                <a v-if="item.type === undefined || item.type === 'item'"
                   :id="`context-item-${index}-${uuid}`"
                   :key="`${item.name}-${index}-${uuid}`"
                   :tabindex="index"
                   class="context-item"
                   :class="{ disabled: item.disabled }"
                   :href="item.disabled ? undefined : item.link"
                   :target="item.target"
                   @click.stop="onClickMenu(item, index, $event)"
                   @keyup.enter="onClickMenu(item, index, $event)"
                   @keydown.up="onKeyUp(index)"
                   @keydown.down="onKeyDown(index)"
                >
                    <p-i v-if="multiSelectable"
                         :name="selectedNames.includes(item.name) ? 'ic_checkbox--checked' : 'ic_checkbox'"
                         class="select-marker"
                    />
                    <p-i v-else-if="showRadioIcon"
                         :name="selectedNames.includes(item.name) ? 'ic_radio--checked' : 'ic_radio'"
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
                    <div :key="index" class="context-header">
                        {{ item.label }}
                    </div>
                </slot>
            </template>
        </slot>
        <div v-show="menu.length === 0" class="context-item empty">
            <slot name="no-data-format" v-bind="{...$props, uuid}">
                {{ $t('COMPONENT.CONTEXT_MENU.NO_ITEM') }}
            </slot>
        </div>
        <div v-if="loading" class="loader">
            <p-lottie name="thin-spinner" auto :size="1" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, ComponentRenderProxy, getCurrentInstance, watch,
} from '@vue/composition-api';

import PLottie from '@/foundation/lottie/PLottie.vue';
import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';

import { ContextMenuProps, MenuItem } from '@/inputs/context-menu/type';
import { i18n } from '@/translations';
import { makeOptionalProxy } from '@/util/composition-helpers';

const filterSelectedItems = (selected: MenuItem[], menu: MenuItem[]) => {
    const filtered = selected.filter(d => menu.find(item => item.name === d.name));
    if (filtered.length === selected.length) return selected;
    return filtered;
};

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
        loading: {
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
        strictSelectMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ContextMenuProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxySelected: makeOptionalProxy('selected', vm, props.selected),
            selectedNames: computed(() => state.proxySelected.map(item => item.name)),
            selectableMenuItems: computed(() => props.menu.filter(d => !d.disabled && (d.type === undefined || d.type === 'item'))),
            isAllSelected: computed(() => state.selectableMenuItems.length
                    && state.selectableMenuItems.length === state.proxySelected.length
                && state.proxySelected.every(item => state.selectableMenuItems.find(selected => selected.name === item.name))),
            selectedCountInFilteredMenu: computed(() => props.menu.filter(d => state.selectedNames.includes(d.name)).length),
            menuItemLength: computed(() => props.menu.filter(d => d.type === undefined || d.type === 'item').length),
            uuid: computed(() => {
                // CAUTION: Do not delete code belows. This is for detecting menu changes.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const menu = props.menu;
                return `${Math.random()}`.slice(2);
            }),
        });

        let focusedItemEl: HTMLElement | null = null;
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
            const el = document.getElementById(`context-item-${idx}-${state.uuid}`);
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
        const onClickMenu = (item, index, event) => {
            if (!props.menu[index].disabled) {
                emit(`${item.name}:select`, index, event);
                emit('select', item, index);

                if (props.multiSelectable) {
                    if (state.selectedNames.includes(item.name)) {
                        const indexOfSelectedList = state.selectedNames.indexOf(item.name);
                        state.proxySelected.splice(indexOfSelectedList, 1);
                        state.proxySelected = [...state.proxySelected];
                    } else {
                        state.proxySelected = [...state.proxySelected, item];
                    }
                } else {
                    state.proxySelected = [item];
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
                state.proxySelected = state.selectableMenuItems.filter(d => d.type === undefined || d.type === 'item');
            }
        };

        watch(() => state.proxySelected, (proxySelected) => {
            if (!proxySelected.length) return;

            if (props.strictSelectMode) {
                state.proxySelected = filterSelectedItems(proxySelected, state.selectableMenuItems);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
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
    @apply rounded bg-white border border-gray-300;
    position: relative;
    min-width: 100%;
    text-align: left;
    background-clip: padding-box;
    max-height: 32rem;
    overflow-y: auto;
    border-width: 1px;
    border-style: solid;
    user-select: none;

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
        @apply text-gray-500;
        margin-top: 0.875rem;
        margin-bottom: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-weight: bold;
        font-size: 0.75rem;
        line-height: 1.5;
    }
    .context-divider {
        @apply border-t border-gray-200;
        border-top-width: 1px;
        border-top-style: solid;
    }
    .context-item {
        @apply text-gray-900;
        display: flex;
        padding: 0.25rem 0.5rem;
        line-height: 1.6;
        font-size: 0.875rem;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;

        &:not(.disabled):not(.empty) {
            &:hover {
                @apply bg-blue-100;
            }
            &:focus {
                @apply bg-blue-200;
            }
        }
        &.disabled {
            @apply text-gray-300;
            cursor: not-allowed;
        }
        &.empty {
            @apply text-gray-300;
            cursor: default;
        }

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
            flex-shrink: 0;
            margin-right: 0.25rem;
        }
    }

    .loader {
        @apply absolute w-full h-full flex items-center justify-center;
        left: 0;
        top: 0;
        background-color: rgba(theme('colors.white'), 0.5);
    }
}
</style>
