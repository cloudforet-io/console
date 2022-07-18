<template>
    <div class="p-context-menu"
         @keyup.esc="onClickEsc"
    >
        <slot v-show="menu.length > 0" name="menu" v-bind="{...$props}">
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
            <div v-if="multiSelectable" class="select-all-wrapper" @click.stop="onClickSelectAll">
                <p-i :name="isAllSelected ? 'ic_checkbox--checked' : 'ic_checkbox'"
                     class="select-marker" width="1em" height="1em"
                />
                <span>{{ $t('COMPONENT.CONTEXT_MENU.SELECT_ALL') }}</span>
            </div>
            <template v-for="(item, index) in menu">
                <p-context-menu-item v-if="item.type === undefined || item.type === 'item'"
                                     :id="getItemId(index)"
                                     :key="`item-${item.name}-${index}`"
                                     :name="item.name"
                                     :label="item.label"
                                     :link="item.link"
                                     :target="item.target"
                                     :disabled="item.disabled"
                                     :selected="!noSelectIndication && selectedNameMap[item.name] !== undefined"
                                     :select-marker="multiSelectable ? 'checkbox' : (showRadioIcon ? 'radio' : undefined)"
                                     :ellipsis="itemHeightFixed"
                                     :highlight-term="highlightTerm"
                                     :tabindex="index"
                                     @click.stop="onClickMenu(item, index, $event)"
                                     @keyup.enter="onClickMenu(item, index, $event)"
                                     @keydown.up="onKeyUp(index)"
                                     @keydown.down="onKeyDown(index)"
                >
                    <template #default>
                        <slot name="item--format" v-bind="{...$props, item, index}" />
                    </template>
                    <template #text-list="{text, matched, textList, regex, index: textIndex}">
                        <slot name="item-text-list" v-bind="{...$props, item, index, text, matched, textList, regex, textIndex}" />
                    </template>
                </p-context-menu-item>
                <div v-else-if="item.type==='divider'" :key="`divider-${index}`" class="context-divider" />
                <slot v-else-if="item.type==='header'" :name="`header-${item.name}`" v-bind="{...$props, item, key: index}">
                    <div :key="index" class="context-header">
                        {{ item.label }}
                    </div>
                </slot>
                <div v-else-if="item.type === 'button'" :key="`button-${index}`" class="context-button"
                     :class="{disabled: item.disabled}"
                >
                    <p-button :disabled="item.disabled"
                              size="sm"
                              style-type="gray-border"
                              font-weight="bold"
                              :outline="true"
                              :block="true"
                              :icon="item.icon"
                              @click="$emit('click-button', item, index, $event)"
                    >
                        {{ item.label }}
                    </p-button>
                </div>
            </template>
        </slot>
        <div v-show="menu.length === 0" class="no-data">
            <slot name="no-data-format" v-bind="{...$props}">
                {{ $t('COMPONENT.CONTEXT_MENU.NO_ITEM') }}
            </slot>
        </div>
        <div v-show="loading" class="loader-wrapper">
            <div class="loader-backdrop" />
            <div class="loader">
                <p-lottie name="thin-spinner" auto :size="1.5" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import { useListFocus } from '@/hooks/list-focus';
import { useProxyValue } from '@/hooks/proxy-state';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PContextMenuItem from '@/inputs/context-menu/context-menu-item/PContextMenuItem.vue';
import type { ContextMenuProps, MenuItem } from '@/inputs/context-menu/type';
import { i18n } from '@/translations';


const getFilteredSelectedItems = (selected: MenuItem[], menu: MenuItem[]): MenuItem[] => {
    const filtered = selected.filter(d => menu.find(item => item.name === d.name));
    if (filtered.length === selected.length) return selected;
    return filtered;
};

const FOCUS_GROUP_ID = 'context-item';

export default defineComponent<ContextMenuProps>({
    name: 'PContextMenu',
    components: {
        PContextMenuItem,
        PLottie,
        PI,
        PButton,
    },
    i18n,
    props: {
        menu: {
            type: Array as PropType<MenuItem[]>,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Array as PropType<MenuItem[]>,
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
        itemHeightFixed: {
            type: Boolean,
            default: false,
        },
        highlightTerm: {
            type: String,
            default: '',
        },
        noSelectIndication: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxySelected: useProxyValue<MenuItem[]>('selected', props, emit),
            selectedNameMap: computed<Record<string, number>>(() => {
                const selectedMap = {};
                state.proxySelected.forEach((item, idx) => {
                    selectedMap[item.name] = idx;
                });
                return selectedMap;
            }),
            selectableMenuItems: computed(() => props.menu.filter(d => !d.disabled && (d.type === undefined || d.type === 'item'))),
            isAllSelected: computed(() => state.selectableMenuItems.length
                    && state.selectableMenuItems.length === state.proxySelected.length
                && state.proxySelected.every(item => state.selectableMenuItems.find(selected => selected.name === item.name))),
            selectedCountInFilteredMenu: computed(() => state.selectableMenuItems.filter(d => state.selectedNameMap[d.name] !== undefined).length),
            menuItemLength: computed(() => props.menu.filter(d => d.type === undefined || d.type === 'item').length),
        });


        const {
            focus: _focus, blur: _blur, handleMoveUp, handleMoveDown, getItemId,
        } = useListFocus<MenuItem>(computed(() => props.menu), FOCUS_GROUP_ID, item => (!item.type || item.type === 'item') && !item.disabled);

        /* util */
        const focus = (position) => {
            const focusedIdx = _focus(position);
            if (focusedIdx !== undefined) emit('focus', focusedIdx);
        };
        const blur = () => {
            _blur();
            emit('blur');
        };

        /* event */
        const onKeyUp = (idx: number) => {
            const focusedIdx = handleMoveUp(idx);
            if (focusedIdx === undefined) emit('keyup:up:end');
        };
        const onKeyDown = (idx) => {
            const focusedIdx = handleMoveDown(idx);
            if (focusedIdx === undefined) emit('keyup:down:end');
        };
        const onClickMenu = (item: MenuItem, index, event) => {
            if (item.disabled) return;

            if (props.multiSelectable) {
                if (state.selectedNameMap[item.name ?? ''] !== undefined) {
                    const indexOfSelected = state.selectedNameMap[item.name ?? ''];
                    state.proxySelected.splice(indexOfSelected, 1);
                    state.proxySelected = [...state.proxySelected];
                } else {
                    state.proxySelected.splice(state.proxySelected.length - 1, 0, item);
                    state.proxySelected = [...state.proxySelected];
                }
            } else {
                state.proxySelected = [item];
            }

            emit(`${item.name}:select`, index, event);
            emit('select', item, index);
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
                state.proxySelected = getFilteredSelectedItems(proxySelected, state.selectableMenuItems);
            }
        }, { immediate: true });

        onUnmounted(() => {
            state.proxySelected = [];
        });

        return {
            ...toRefs(state),
            onClickMenu,
            onKeyDown,
            onKeyUp,
            focus,
            onClickEsc,
            onClickSelectAll,
            getItemId,
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

    > .selected-list-wrapper {
        @apply border-b border-gray-200;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        line-height: 1.5;
        padding: 0.5rem;
    }
    > .select-all-wrapper {
        @apply font-semibold;
        padding: 0 0.5rem;
        font-size: 0.875rem;
        line-height: 2rem;
        vertical-align: middle;
        cursor: pointer;
        > .select-marker {
            font-size: 1.25rem;
            margin-right: 0.25rem;
        }
    }
    > .context-header {
        @apply text-gray-500;
        margin-top: 0.875rem;
        margin-bottom: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-weight: bold;
        font-size: 0.75rem;
        line-height: 1.5;
    }
    > .context-divider {
        @apply border-t border-gray-200;
        border-top-width: 1px;
        border-top-style: solid;
    }
    > .context-button {
        padding: 0.5rem 0.5rem 0.75rem 0.5rem;

        @media (hover: hover) {
            &:hover:not(.disabled) {
                @apply bg-blue-100;
            }
        }
    }

    > .loader-wrapper {
        @apply absolute w-full h-full overflow-hidden;
        top: 0;
        z-index: 1;
        .loader-backdrop {
            @apply w-full h-full bg-white;
            opacity: 0.5;
        }
        .loader {
            @apply absolute flex w-full h-full justify-center items-center;
            top: 0;
            z-index: 1;
            max-height: 16.875rem;
        }
    }
    > .no-data {
        @apply text-gray-300;
        padding: 0.5rem;
        line-height: 1.25;
        font-size: 0.875rem;
    }
}
</style>
