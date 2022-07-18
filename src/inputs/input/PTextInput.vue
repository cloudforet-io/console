<template>
    <div
        class="p-text-input"
        :class="{block, focused: isFocused}"
    >
        <div ref="targetRef"
             class="input-container"
             :class="{invalid: isInvalid || invalid, disabled}"
        >
            <template v-if="proxySelectedValue.length && multiInput">
                <p-tag v-for="(tag, index) in proxySelectedValue" :key="index"
                       :deletable="!disabled"
                       :selected="index === deleteTargetIdx"
                       :invalid="tag.invalid"
                       class="tag"
                       @delete="handleDeleteTag(tag, index)"
                >
                    {{ tag.label || tag.value }}
                </p-tag>
            </template>
            <slot name="default" v-bind="{ value }">
                <input v-model="proxyValue"
                       :disabled="disabled"
                       :type="type"
                       :placeholder="placeholder"
                       size="1"
                       v-on="inputListeners"
                >
            </slot>
            <span v-if="$slots['right-extra']" class="right-extra">
                <slot name="right-extra" v-bind="{ value }">
                    {{ value }}
                </slot>
            </span>
            <p-i
                v-show="(isFocused || isInvalid)"
                class="delete-all-icon"
                name="ic_delete" height="1rem" width="1rem"
                color="inherit transparent"
                @mousedown.native.prevent
                @click="handleDeleteAllTags"
            />
        </div>
        <p-context-menu v-if="proxyVisibleMenu && useAutoComplete"
                        ref="menuRef"
                        :menu="bindingMenu"
                        :highlight-term="proxyValue"
                        :loading="loading"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        @select="handleSelectMenuItem"
                        @focus="handleFocusMenuItem"
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import vClickOutside from 'v-click-outside';
import { focus } from 'vue-focus';

import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import { useProxyValue } from '@/hooks/proxy-state';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type { SearchDropdownMenuItem } from '@/inputs/dropdown/search-dropdown/type';
import { inputTypes } from '@/inputs/input/config';
import type { SelectedItem } from '@/inputs/input/type';


export default {
    name: 'PTextInput',
    components: {
        PTag,
        PI,
        PContextMenu,
    },
    directives: {
        focus,
        clickOutside: vClickOutside.directive,
    },
    model: {
        prop: 'value',
        event: 'input',
    },
    props: {
        value: {
            type: [String, Number],
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'text',
            validator: value => inputTypes.includes(value),
        },
        block: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: '',
        },
        multiInput: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Array as PropType<SelectedItem[]>,
            default: () => [],
        },
        /* context menu fixed style props */
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        useFixedMenuStyle: {
            type: Boolean,
            default: false,
        },
        /* context menu props */
        menu: {
            type: Array as PropType<MenuItem[]>,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        /* extra props */
        handler: {
            type: Function,
            default: undefined,
        },
        disableHandler: {
            type: Boolean,
            default: false,
        },
        exactMode: {
            type: Boolean,
            default: true,
        },
        useAutoComplete: {
            type: Boolean,
            default: false,
        },
    },

    setup(props, { emit, listeners }) {
        const {
            proxyVisibleMenu, targetRef, targetElement, contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
            visibleMenu: computed(() => props.visibleMenu),
        });
        const contextMenuFixedStyleState = reactive({
            proxyVisibleMenu, targetRef, targetElement, contextMenuStyle,
        });

        const state = reactive({
            menuRef: null,
            targetRef: null,
            isFocused: false,
            proxyValue: useProxyValue('value', props, emit, 'input'),
            proxySelectedValue: useProxyValue('selected', props, emit),
            deleteTarget: undefined as string | undefined,
            deleteTargetIdx: -1,
            isTagDeletable: false,
            isInvalid: props.selected.some(item => item.invalid),
            searchableItems: computed<MenuItem[]>(() => props.menu.filter(d => d.type === undefined || d.type === 'item')),
            filteredMenu: [] as MenuItem[],
            bindingMenu: computed<SearchDropdownMenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
        });

        const handleDeleteTag = (val, idx) => {
            const _selectedItems: SelectedItem[] = [...state.proxySelectedValue];
            _selectedItems.splice(idx, 1);

            const _selectedValues = _selectedItems.map(d => d.value);
            _selectedItems.forEach((selected, sIdx) => {
                selected.duplicated = _selectedValues.slice(0, sIdx).includes(selected.value);
            });
            state.proxySelectedValue = _selectedItems;
            state.deleteTargetIdx = -1;
            state.deleteTarget = undefined;
            emit('delete-tag', val, idx);
        };

        const hideMenu = () => {
            contextMenuFixedStyleState.proxyVisibleMenu = false;
            emit('hide-menu');
        };

        const showMenu = () => {
            contextMenuFixedStyleState.proxyVisibleMenu = true;
            emit('show-menu');
        };

        const handleDeleteAllTags = () => {
            state.proxySelectedValue = [];
            state.proxyValue = '';
            hideMenu();
            emit('delete-all-tags');
        };

        const defaultHandler = (inputText: string, list: MenuItem[]) => {
            let results: MenuItem[] = [...list];
            const trimmed = inputText.trim();
            if (trimmed) {
                const regex = new RegExp(inputText, 'i');
                results = results.filter(d => regex.test(d.label as string));
            }
            return { results };
        };

        const filterMenu = async (val: string) => {
            if (props.disableHandler) return;

            if (props.handler) {
                let res = props.handler(val, state.searchableItems);
                if (res instanceof Promise) res = await res;
                state.filteredMenu = res.results;
            } else {
                const results = defaultHandler(val, state.searchableItems).results;

                const filtered = props.menu.filter((item) => {
                    if (item.type && item.type !== 'item') return true;
                    return !!results.find(d => d.label === item.label);
                });
                if (filtered[filtered.length - 1]?.type === 'divider') filtered.pop();
                state.filteredMenu = filtered;
            }
        };

        const handleFocusMenuItem = (idx: string) => {
            emit('focus-menu', idx);
        };

        const handleSelectMenuItem = ({ label, name }: SearchDropdownMenuItem) => {
            const _selectedItems = [...state.proxySelectedValue, { label, value: name }];
            const _selectedValues = _selectedItems.map(d => d.value);
            _selectedItems.forEach((selected, idx) => {
                selected.duplicated = _selectedValues.slice(0, idx).includes(selected.value);
            });
            state.proxySelectedValue = _selectedItems;
            state.proxyValue = '';
            hideMenu();
        };

        const deleteSelectedTags = () => {
            if (state.proxyValue.length > 0) return;
            const lastIdx = state.proxySelectedValue.length - 1;
            if (state.deleteTargetIdx === -1) { // Select the item if there is no selection
                state.deleteTargetIdx = lastIdx;
                state.deleteTarget = state.proxySelectedValue[lastIdx];
                return;
            }

            const deleteTargetIdx = state.deleteTargetIdx;
            const deleteTargetTag = state.proxySelectedValue[deleteTargetIdx];

            if (!deleteTargetTag) state.proxySelectedValue = [];
            handleDeleteTag(deleteTargetTag, deleteTargetIdx);
        };

        const inputListeners = {
            ...listeners,
            input(event) {
                state.proxyValue = event.target.value;
                if (state.proxyValue.length && props.useAutoComplete) {
                    showMenu();
                    filterMenu(state.proxyValue);
                }
                emit('input', event.target.value);
            },
            focus() {
                state.isFocused = true;
                emit('focus');
            },
            blur() {
                state.isFocused = false;
                emit('blur');
            },
            keyup(event) {
                if ((event.key === 'ArrowDown' || event.key === 'Down') && props.useAutoComplete) {
                    if (state.bindingMenu.length === 0) return;
                    if (state.menuRef) state.menuRef.focus();
                }
                if (event.code === 'Enter') {
                    if (event.target.value.length > 0 && props.multiInput) {
                        handleSelectMenuItem({ label: event.target.value, name: event.target.value });
                    }
                }
                emit('keyup', event);
            },
            keydown(event) {
                if (event.code === 'Backspace') {
                    const isInputEmpty = state.proxySelectedValue.length <= 1 && state.proxyValue.length <= 1;
                    if (isInputEmpty && props.useAutoComplete) hideMenu();
                    if (props.multiInput) deleteSelectedTags();
                }
                emit('keydown', event);
            },
        };

        watch(() => props.menu, (menu) => {
            state.filteredMenu = menu;
            filterMenu(state.proxyValue);
        });

        const init = () => {
            state.filteredMenu = props.menu;
            if (props.selected && props.multiInput) {
                if (Array.isArray(props.selected)) {
                    state.proxySelectedValue = props.selected;
                } else {
                    state.proxySelectedValue = [props.selected];
                }
            }
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            inputListeners,
            handleDeleteTag,
            handleDeleteAllTags,
            handleFocusMenuItem,
            handleSelectMenuItem,
        };
    },
};
</script>

<style lang="postcss">
.p-text-input {
    @apply relative;
    width: 15rem;
    display: inline-block;
    &.block {
        @apply w-full;
    }
    > .input-container {
        @apply relative inline-flex flex-wrap border bg-white text-gray-900 rounded items-center;
        width: inherit;
        min-height: 2rem;
        height: auto;
        font-size: 0.875rem;
        line-height: 2rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;

        &.invalid {
            @apply border-alert;
        }
        &.disabled {
            @apply border-gray-300 bg-gray-100;
        }
        &.focused, &:focus-within:not(.disabled):not(.invalid) {
            @apply border-secondary bg-blue-100;
            > input {
                padding-right: 1rem;
            }
            > .right-extra {
                padding-right: 1rem;
            }
        }
        &:hover:not(.disabled):not(.invalid) {
            @apply border-secondary;
        }
        > .tag {
            height: 1.25rem;
            min-width: 2.5rem;
        }

        input {
            @apply truncate;
            display: inline-block;
            flex-grow: 1;
            padding-right: 0.5rem;
            border-width: 0;
            height: 100%;
            appearance: none;
            line-height: inherit;
            font-size: inherit;
            color: inherit;
            background-color: transparent;

            &:disabled {
                @apply bg-transparent border-0;
            }

            &::placeholder {
                @apply text-gray-300;
            }
        }

        > .right-extra {
            @apply text-gray-400;
            display: inline-flex;
            flex-shrink: 0;
            height: 100%;
            overflow: hidden;
            line-height: inherit;
            font-size: inherit;
        }

        .delete-all-icon {
            @apply text-gray-400 cursor-pointer;
            position: absolute;
            right: 0.5rem;
        }
    }
    .p-context-menu {
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: 100%;
    }
}
</style>
