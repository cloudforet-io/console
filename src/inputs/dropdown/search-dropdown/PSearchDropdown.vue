<template>
    <div class="p-search-dropdown" :class="[ {'multi-selectable' : multiSelectable} ]">
        <p-search ref="targetRef"
                  v-model="proxyValue"
                  :placeholder="_placeholder ? _placeholder : $t('COMPONENT.SEARCH_DROPDOWN.PLACEHOLDER')"
                  :disable-icon="true"
                  :is-focused.sync="proxyIsFocused"
                  :invalid="invalid"
                  :disabled="disabled"
                  :readonly="readonly"
                  @delete="onDeleteSearchText"
                  @click.native.stop="handleClick"
                  v-on="searchListeners"
        >
            <div v-if="searchDropdownType === SEARCH_DROPDOWN_TYPE.radioButton &&
                     proxySelected.length &&
                     !proxyVisibleMenu &&
                     !proxyIsFocused"
                 ref="selectedRadioRef"
                 class="selected-radio-label"
            >
                <span><slot name="selected-radio-label" :selected="proxySelected[0]">{{ proxySelected[0].label || proxySelected[0].name }}</slot></span>
                <p-i class="delete-icon" name="ic_delete"
                     height="1rem" width="1rem"
                     @click="onDeleteTag(proxySelected[0], 0)"
                />
            </div>
            <template v-if="multiSelectable && proxySelected.length" #left>
                <p-tag v-for="(selectedItem, index) in proxySelected" :key="`tag-box-${index}`" :deletable="!disabled"
                       @delete="onDeleteTag(selectedItem, index)"
                >
                    {{ selectedItem.label || selectedItem.name }}
                </p-tag>
                <p-i v-if="!disableDeleteAll"
                     class="delete-icon" name="ic_delete"
                     height="1rem" width="1rem"
                     @click="onDeleteAllTags"
                />
            </template>
            <template v-if="searchDropdownType !== SEARCH_DROPDOWN_TYPE.default || !proxySelected.length || proxyVisibleMenu" #right>
                <p-i :name="proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                     color="inherit" class="dropdown-button" :class="disabled"
                     @click.stop="handleClickDropdownButton"
                />
            </template>
            <template v-for="(_, slot) of searchSlots" #[slot]="scope">
                <slot :name="`search-${slot}`" v-bind="{...scope}" />
            </template>
        </p-search>
        <p-context-menu v-show="proxyVisibleMenu"
                        ref="menuRef"
                        :menu="bindingMenu"
                        :loading="loading"
                        :strict-select-mode="strictSelectMode"
                        :selected.sync="proxySelected"
                        :multi-selectable="multiSelectable"
                        :show-radio-icon="searchDropdownType === SEARCH_DROPDOWN_TYPE.radioButton"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        :class="searchDropdownType"
                        @select="handleSelectMenuItem"
                        @keyup:up:end="focusSearch"
                        @keyup:esc="focusSearch"
                        @focus="onFocusMenuItem"
        >
            <template #item--format="{item}">
                <span class="p-search-dropdown__item-label">
                    <span v-for="(text, i) in item.label.split(searchRegex)"
                          :key="`item-label--${text}-${i}`"
                          :class="{ 'selected': searchDropdownType === SEARCH_DROPDOWN_TYPE.default && item.name === selectedNames[0] }"
                    >
                        <span v-if="i !== 0" class="font-bold">{{ getMatchText(item.label) }}</span><span>{{ text }}</span>
                    </span>
                </span>
            </template>
            <template v-for="(_, slot) of menuSlots" #[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="scope" />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import type { ComponentRenderProxy } from '@vue/composition-api';
import {
    computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { reduce } from 'lodash';


import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { SearchDropdownProps, SearchDropdownMenuItem } from '@/inputs/dropdown/search-dropdown/type';
import {
    SEARCH_DROPDOWN_TYPE,
} from '@/inputs/dropdown/search-dropdown/type';
import PSearch from '@/inputs/search/search/PSearch.vue';
import { makeOptionalProxy } from '@/util/composition-helpers';


export default defineComponent<SearchDropdownProps>({
    name: 'PSearchDropdown',
    components: {
        PSearch,
        PContextMenu,
        PI,
        PTag,
    },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        /* search props */
        value: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: undefined,
        },
        isFocused: {
            type: Boolean,
            default: undefined,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        /* context menu props */
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
        /* context menu fixed style props */
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        useFixedMenuStyle: {
            type: Boolean,
            default: false,
        },
        /* extra props */
        type: {
            type: String,
            default: undefined,
        },
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
        strictSelectMode: {
            type: Boolean,
            default: false,
        },
        disableDeleteAll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: SearchDropdownProps, { emit, slots, listeners }) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;

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
            selectedRadioRef: null as null|HTMLElement,
            searchDropdownType: computed<SEARCH_DROPDOWN_TYPE | undefined>(() => {
                if (props.type) return props.type;
                if (!props.multiSelectable) return SEARCH_DROPDOWN_TYPE.default;
                return undefined;
            }),
            proxyValue: makeOptionalProxy('value', vm, ''),
            proxyIsFocused: makeOptionalProxy('isFocused', vm, false),
            proxySelected: makeOptionalProxy('selected', vm, []),
            _placeholder: undefined as string|undefined,
            filteredMenu: [] as SearchDropdownMenuItem[],
            bindingMenu: computed<SearchDropdownMenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
            searchableItems: computed<SearchDropdownMenuItem[]>(() => props.menu.filter(d => d.type === undefined || d.type === 'item')),
            searchRegex: computed(() => new RegExp(state.proxyValue || '', 'i')),
            selectedNames: computed(() => state.proxySelected.map(item => item.name)),
            //
            menuSlots: computed(() => reduce(slots, (res, d, name) => {
                if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
                return res;
            }, {})),
            searchSlots: computed(() => reduce(slots, (res, d, name) => {
                if (name.startsWith('search-')) res[`${name.substring(7)}`] = d;
                return res;
            }, {})),
        });

        const defaultHandler = (inputText: string, list: SearchDropdownMenuItem[]) => {
            let results: SearchDropdownMenuItem[] = [...list];
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

        const getMatchText = (text: string): string => {
            const res = state.searchRegex.exec(text);
            if (res) return res[0];
            return '';
        };


        /* event util */
        const focusSearch = () => {
            if (state.proxyIsFocused) return;
            state.proxyIsFocused = true;
        };

        const hideMenu = (mode?: string) => {
            if (!contextMenuFixedStyleState.proxyVisibleMenu) return;
            // placeholder
            const isRadioItemSelected = state.searchDropdownType === SEARCH_DROPDOWN_TYPE.radioButton && (mode === 'click' || state.proxySelected.length);
            if (isRadioItemSelected) {
                state._placeholder = '';
            } else if (props.multiSelectable && state.proxySelected.length) {
                state._placeholder = ' ';
            } else {
                state._placeholder = props.placeholder;
            }

            // value
            const isDefaultItemSelected = state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default && mode !== 'click';
            if (isDefaultItemSelected) {
                const item = state.proxySelected[0];
                if (item) state.proxyValue = item.label ?? item.name ?? '';
                else state.proxyValue = '';
            }
            if (state.searchDropdownType !== SEARCH_DROPDOWN_TYPE.default) {
                state.proxyValue = '';
            }

            contextMenuFixedStyleState.proxyVisibleMenu = false;
            emit('hide-menu');
        };

        const showMenu = () => {
            if (contextMenuFixedStyleState.proxyVisibleMenu) return;

            if (
                state.proxySelected.length && (
                    state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default
                    || state.searchDropdownType === SEARCH_DROPDOWN_TYPE.radioButton
                )
            ) {
                // If there is an existing selected item, the value will be placeholder & filter will be initialized
                const selectedItem = state.proxySelected[0] as SearchDropdownMenuItem;
                state._placeholder = selectedItem.label ?? selectedItem.name ?? '';
                state.proxyValue = '';
                filterMenu('');
            } else {
                filterMenu(state.proxyValue);
            }

            contextMenuFixedStyleState.proxyVisibleMenu = true;
            emit('show-menu');
        };

        const focusMenu = () => {
            if (state.bindingMenu.length === 0) return;
            if (state.menuRef) state.menuRef.focus();
        };

        const allFocusOut = () => {
            if (!state.proxyIsFocused) return;
            state.proxyIsFocused = false;
            hideMenu();
        };


        /* event */
        const onFocusMenuItem = (index: string) => {
            emit('focus-menu', index);
        };

        const onFocusSearchInput = () => {
            showMenu();
        };

        const onDeleteTag = (item: SearchDropdownMenuItem, index: number) => {
            state.proxySelected.splice(index, 1);
            state.proxySelected = [...state.proxySelected];
            emit('delete-tag', item, index);
        };

        const onDeleteAllTags = () => {
            state.proxySelected = [];
            emit('delete-all-tags');
        };

        const onDeleteSearchText = () => {
            if (state.proxyValue) {
                state.proxyValue = '';
            }

            if (state.proxySelected.length === 0) return;

            if (state.searchDropdownType !== SEARCH_DROPDOWN_TYPE.default) return;

            const item = state.proxySelected[0];
            state.proxySelected.splice(0, 1);
            emit('delete-tag', item, 0);
        };

        const onInput = (val: string, e) => {
            if (!contextMenuFixedStyleState.proxyVisibleMenu) showMenu();

            state.proxyValue = val;
            emit('input', val, e);

            filterMenu(val);
        };

        const handleSelectMenuItem = (item: SearchDropdownMenuItem) => {
            if ([SEARCH_DROPDOWN_TYPE.default, SEARCH_DROPDOWN_TYPE.radioButton].includes(state.searchDropdownType)) {
                hideMenu('click');
            }
            if (state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default) {
                state.proxyValue = item.label ?? item.name ?? '';
            }
            if (props.multiSelectable) state.proxyIsFocused = true;

            emit('select-menu', item);
        };

        const onSearch = (val?: string) => {
            const trimmed = val?.trim() ?? '';
            const menuItem = state.filteredMenu.find(d => trimmed.toLowerCase() === d.label?.toLowerCase());
            if (menuItem) {
                emit('select-menu', menuItem);
                state.proxyValue = menuItem.label ?? menuItem.name ?? '';
                if (state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default) {
                    state.proxySelected = [menuItem];
                } else if (!state.selectedNames.includes(menuItem.name)) {
                    state.proxySelected.push(menuItem);
                }
            } else if (state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default) {
                if (!state.proxySelected.length) state.proxyValue = '';
            }

            if (!menuItem && props.exactMode) {
                state.proxyValue = '';
                emit('search', '');
            } else {
                emit('search', trimmed);
            }

            vm.$nextTick(() => {
                allFocusOut();
            });
        };

        const onDelete = () => {
            emit('search', '');
            focusSearch();
        };

        const handleClickDropdownButton = () => {
            if (props.disabled) return;
            if (contextMenuFixedStyleState.proxyVisibleMenu) hideMenu();
            else showMenu();
        };

        const handleClick = (e) => {
            if (props.disabled) return;
            state.proxyIsFocused = true;
            showMenu();
            emit('click', e);
        };

        const searchListeners = {
            ...listeners,
            keyup(e) {
                if (e.key === 'ArrowDown' || e.key === 'Down') focusMenu();
                else if (e.key === 'Escape' || e.key === 'Esc') allFocusOut();
                emit('keyup', e);
            },
            focus(e) {
                onFocusSearchInput();
                emit('focus', e);
            },
            delete(...args) {
                onDelete();
                emit('delete', ...args);
            },
            search: onSearch,
            input: onInput,
        };

        const onWindowKeydown = (e: KeyboardEvent) => {
            if (contextMenuFixedStyleState.proxyVisibleMenu && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
            }
        };
        const forceHideMenu = () => {
            hideMenu();
        };
        onMounted(() => {
            window.addEventListener('click', forceHideMenu);
            window.addEventListener('blur', forceHideMenu);
            window.addEventListener('keydown', onWindowKeydown, false);
        });
        onUnmounted(() => {
            window.removeEventListener('click', forceHideMenu);
            window.removeEventListener('blur', forceHideMenu);
            window.removeEventListener('keydown', onWindowKeydown, false);
        });

        watch(() => props.menu, (menu) => {
            state.filteredMenu = menu;
            filterMenu(state.proxyValue);
        });

        watch(() => state.proxySelected, (proxySelected) => {
            if (!proxySelected.length) {
                state._placeholder = props.placeholder;
                if (state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default) state.proxyValue = '';
                return;
            }

            if (state.searchDropdownType === SEARCH_DROPDOWN_TYPE.default) {
                const item = state.proxySelected[0];
                if (item) state.proxyValue = item.label ?? item.name ?? '';
                else state.proxyValue = '';
            } else if (state.searchDropdownType === SEARCH_DROPDOWN_TYPE.radioButton && state._placeholder !== '') {
                state._placeholder = '';
            }
        }, { immediate: true });

        watch(() => props.disabled, (disabled) => {
            if (disabled === true) forceHideMenu();
        });

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            SEARCH_DROPDOWN_TYPE,
            getMatchText,
            handleSelectMenuItem,
            focusSearch,
            onFocusMenuItem,
            onDeleteTag,
            onDeleteAllTags,
            onDeleteSearchText,
            handleClickDropdownButton,
            handleClick,
            searchListeners,
        };
    },
});
</script>

<style lang="postcss">
.p-search-dropdown {
    @apply w-full relative;
    .p-search {
        @apply text-sm font-normal;
        &.disabled {
            @apply text-gray-300;
            .dropdown-button {
                cursor: default;
            }
        }
        &.focused:not(.disabled) {
            .dropdown-button {
                @apply text-secondary;
            }
        }
    }
    .selected-radio-label {
        @apply w-full flex justify-between items-center;
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
        line-height: 1.125rem;
    }
    .delete-icon {
        @apply min-w-4;
    }
    .dropdown-button {
        cursor: pointer;
        flex-shrink: 0;
    }
    .p-context-menu {
        @apply font-normal;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: 100%;

        &.default {
            .context-item {
                &.selected {
                    @apply bg-blue-200;
                }
                &:not(.disabled):not(.empty) {
                    &:hover, &:focus {
                        @apply bg-blue-100;
                    }
                }
            }
        }

        .p-search-dropdown__item-label {
            flex-grow: 1;
        }
    }

    &.multi-selectable {
        .p-search {
            @apply relative flex-wrap row-gap-1;
            padding-right: 3rem;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;

            .dropdown-button {
                @apply absolute;
                top: 0.1875rem;
                right: 0.5rem;
            }
            > .delete-icon {
                @apply absolute cursor-pointer;
                right: 2rem;
                top: 0.4375rem;
                height: 100%;
            }
        }
    }
}
</style>
