<template>
    <div class="p-search-dropdown">
        <p-search ref="targetRef"
                  v-model="proxyValue"
                  :placeholder="proxyPlaceholder"
                  :disable-icon="disableIcon || (type === SEARCH_DROPDOWN_TYPE.radioButton && !!proxySelected.length) || (type === SEARCH_DROPDOWN_TYPE.checkbox && proxyVisibleMenu)"
                  :is-focused.sync="proxyIsFocused"
                  @keydown.delete="onDeleteSearchText"
                  v-on="searchListeners"
        >
            <template #left>
                <p-tag v-if="type === SEARCH_DROPDOWN_TYPE.radioButton && proxySelected.length"
                       :deletable="false"
                       :activated="proxyVisibleMenu"
                       @delete="onDeleteTag(0)"
                >
                    {{ nameFormatter(proxySelected[0]) }}
                </p-tag>
            </template>
            <template #right>
                <p-i :name="proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'" color="inherit" class="dropdown-button"
                     v-on="searchListeners"
                />
            </template>
            <template v-for="(_, slot) of searchSlots" v-slot:[slot]="scope">
                <slot :name="`search-${slot}`" v-bind="{...scope}" />
            </template>
        </p-search>
        <p-context-menu v-if="proxyVisibleMenu"
                        ref="menuRef"
                        theme="secondary"
                        :menu="bindingMenu"
                        :loading="loading"
                        :selected.sync="proxySelected"
                        :multi-selectable="type === SEARCH_DROPDOWN_TYPE.checkbox"
                        :show-radio-icon="type === SEARCH_DROPDOWN_TYPE.radioButton"
                        :show-selected-list="showSelectedList"
                        :show-select-all="showSelectAll"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        @select="onClickMenuItem"
                        @keyup:up:end="focusSearch"
                        @keyup:esc="focusSearch"
                        @focus="onFocusMenuItem"
        >
            <template #item--format="{item}">
                <span class="p-search-dropdown__item-label">
                    <span v-for="(text, i) in item.label.split(searchRegex)"
                          :key="`item-label--${text}-${i}`"
                          :class="{ 'selected': type === SEARCH_DROPDOWN_TYPE.default && item.name === proxySelected[0] }"
                    >
                        <strong v-if="i !== 0">{{ getMatchText(item.label) }}</strong><span>{{ text }}</span>
                    </span>
                </span>
            </template>
            <template v-for="(_, slot) of menuSlots" v-slot:[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="scope" />
            </template>
        </p-context-menu>
        <div v-if="type === SEARCH_DROPDOWN_TYPE.checkbox && proxySelected.length && showTagBox" class="p-search-dropdown__tag-box">
            <p-tag v-for="(selectedName, index) in proxySelected" :key="`tag-box-${index}`" @delete="onDeleteTag(index)">
                {{ nameFormatter(selectedName) }}
            </p-tag>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { reduce } from 'lodash';

import { makeOptionalProxy } from '@/util/composition-helpers';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';

import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import PSearch from '@/inputs/search/search/PSearch.vue';
import PI from '@/foundation/icons/PI.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';

import {
    SEARCH_DROPDOWN_TYPE, SearchDropdownProps,
} from '@/inputs/search/search-dropdown/type';
import { MenuItem } from '@/inputs/context-menu/type';


export default defineComponent<SearchDropdownProps>({
    name: 'PSearchDropdown',
    components: {
        PIconButton,
        PSearch,
        PContextMenu,
        PI,
        PTag,
        PButton,
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
        disableIcon: {
            type: Boolean,
            default: false,
        },
        isFocused: {
            type: Boolean,
            default: undefined,
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
        showSelectedList: {
            type: Boolean,
            default: false,
        },
        showSelectAll: {
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
            default: SEARCH_DROPDOWN_TYPE.default,
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
        showTagBox: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: SearchDropdownProps, { emit, slots, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

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
            proxyValue: makeOptionalProxy('value', vm, ''),
            proxyIsFocused: makeOptionalProxy('isFocused', vm, false),
            proxySelected: makeOptionalProxy('selected', vm, []),
            proxyPlaceholder: makeOptionalProxy('placeholder', vm, undefined),
            filteredMenu: [] as MenuItem[],
            bindingMenu: computed<MenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
            searchableItems: computed<MenuItem[]>(() => props.menu.filter(d => d.type === undefined || d.type === 'item')),
            searchRegex: computed(() => new RegExp(state.proxyValue || '', 'i')),
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

        /* util */
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

            let results: MenuItem[];
            if (props.handler) {
                let res = props.handler(val, state.searchableItems);
                if (res instanceof Promise) res = await res;
                results = res.results;
            } else {
                results = defaultHandler(val, state.searchableItems).results;
            }

            const filtered = props.menu.filter((item) => {
                if (item.type && item.type !== 'item') return true;
                return !!results.find(d => d.label === item.label);
            });
            if (filtered[filtered.length - 1]?.type === 'divider') filtered.pop();
            state.filteredMenu = filtered;
        };

        const getMatchText = (text: string): string => {
            const res = state.searchRegex.exec(text);
            if (res) return res[0];
            return '';
        };

        const nameFormatter = name => props.menu.find(d => d.name === name)?.label || name;


        /* event util */
        const focusSearch = () => {
            state.proxyIsFocused = true;
        };

        const hideMenu = (mode?: string) => {
            contextMenuFixedStyleState.proxyVisibleMenu = false;

            // placeholder
            if (props.type === SEARCH_DROPDOWN_TYPE.radioButton && (mode === 'click' || state.proxySelected.length)) {
                state.proxyPlaceholder = '';
            } else {
                state.proxyPlaceholder = undefined;
            }

            // value
            if (props.type === SEARCH_DROPDOWN_TYPE.default && mode !== 'click' && state.proxySelected.length) {
                state.proxyValue = props.menu.find(d => d.name === state.proxySelected[0])?.label;
            }
            if (props.type !== SEARCH_DROPDOWN_TYPE.default) {
                state.proxyValue = '';
            }

            emit('hide-menu');
        };

        const showMenu = () => {
            contextMenuFixedStyleState.proxyVisibleMenu = true;
            if (props.type === SEARCH_DROPDOWN_TYPE.default && state.proxySelected.length) {
                // 기존 선택된 값이 있다면 해당 값을 placeholder 처리 & filter 초기화
                state.proxyPlaceholder = props.menu.find(d => d.name === state.proxySelected[0])?.label;
                state.proxyValue = '';
                filterMenu('');
            } else {
                filterMenu(state.proxyValue);
            }
            emit('show-menu');
        };

        const focusMenu = () => {
            if (state.bindingMenu.length === 0) return;
            if (state.menuRef) state.menuRef.focus();
        };

        const allFocusOut = () => {
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

        const onDeleteTag = (index) => {
            state.proxySelected.splice(index, 1);
            emit('delete-tag', index);
        };

        const onDeleteSearchText = (e) => {
            if (!e.target.value.length) {
                state.proxySelected.splice(0, 1);
                emit('delete-tag', 0);
            }
        };

        const onInput = (val: string, e) => {
            if (!contextMenuFixedStyleState.proxyVisibleMenu) showMenu();

            state.proxyValue = val;
            emit('input', val, e);

            filterMenu(val);
        };

        const onClickMenuItem = (name, index) => {
            if (props.type === SEARCH_DROPDOWN_TYPE.default || props.type === SEARCH_DROPDOWN_TYPE.radioButton) {
                hideMenu('click');
            }
            if (props.type === SEARCH_DROPDOWN_TYPE.default) {
                state.proxyValue = state.bindingMenu[index]?.label ?? name;
            }

            emit('select-menu', state.bindingMenu[index]);
        };

        const onSearch = (val?: string) => {
            const trimmed = val?.trim() ?? '';
            const menuItem = state.filteredMenu.find(d => trimmed.toLowerCase() === d.label?.toLowerCase());
            if (menuItem) {
                emit('select-menu', menuItem);
                state.proxyValue = menuItem.label;
                if (props.type === SEARCH_DROPDOWN_TYPE.default) {
                    state.proxySelected = [menuItem.name];
                } else if (!state.proxySelected.includes(menuItem.name)) {
                    state.proxySelected.push(menuItem.name);
                }
            } else if (props.type === SEARCH_DROPDOWN_TYPE.default) {
                state.proxySelected = [];
                state.proxyValue = '';
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
            click(e: MouseEvent) {
                e.stopPropagation();
                showMenu();
                emit('click', e);
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
            if (proxySelected.length) { // && contextMenuFixedStyleState.proxyVisibleMenu
                if (props.type === SEARCH_DROPDOWN_TYPE.radioButton) {
                    state.proxyPlaceholder = '';
                }
            } else {
                state.proxyPlaceholder = undefined;
            }
        });

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            SEARCH_DROPDOWN_TYPE,
            nameFormatter,
            getMatchText,
            onClickMenuItem,
            focusSearch,
            onFocusMenuItem,
            onDeleteTag,
            onDeleteSearchText,
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

        &.focused {
            .dropdown-button {
                @apply text-secondary;
            }
        }
    }
    .p-context-menu {
        @apply font-normal;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: 100%;

        .context-header.secondary {
            @apply text-secondary;
        }
        .p-search-dropdown__item-label {
            flex-grow: 1;
            .selected {
                @apply text-secondary;
                font-weight: bold;
            }
        }
    }
    .p-search-dropdown__tag-box {
        @apply text-gray-900;
        margin-top: 0.625rem;
        .p-tag {
            align-items: center;
            margin-bottom: 0.5rem;
        }
    }
}
</style>
