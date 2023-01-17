<template>
    <div class="p-autocomplete-search">
        <p-search ref="targetRef"
                  v-model="proxyValue"
                  :placeholder="placeholder"
                  :focused="focused"
                  :disabled="disabled"
                  :disable-icon="disableIcon"
                  :is-focused.sync="proxyIsFocused"
                  v-on="searchListeners"
        >
            <template v-for="(_, slot) of searchSlots"
                      #[slot]="scope"
            >
                <slot :name="`search-${slot}`"
                      v-bind="{...scope}"
                />
            </template>
        </p-search>
        <p-context-menu v-if="proxyVisibleMenu"
                        ref="menuRef"
                        :menu="bindingMenu"
                        :loading="loading"
                        no-select-indication
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        @select="onClickMenuItem"
                        @keyup:up:end="focusSearch"
                        @keyup:esc="focusSearch"
                        @focus="onFocusMenuItem"
        >
            <template v-for="(_, slot) of menuSlots"
                      #[slot]="scope"
            >
                <slot :name="`menu-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, toRef, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import Fuse from 'fuse.js';
import { reduce } from 'lodash';

import { useProxyValue } from '@/hooks';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type {
    AutocompleteHandler,
} from '@/inputs/search/autocomplete-search/type';
import PSearch from '@/inputs/search/search/PSearch.vue';
import { makeByPassListeners, makeOptionalProxy } from '@/utils/composition-helpers';


interface AutocompleteSearchProps {
    value: string;
    placeholder?: string;
    focused?: boolean;
    disabled?: boolean;
    disableIcon?: boolean;
    isFocused?: boolean;
    menu: MenuItem[];
    loading?: boolean;
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    exactMode?: boolean;
    // context menu fixed style props
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
}

const fuseOptions = {
    keys: ['label'],
    distance: 100,
    threshold: 0.1,
    ignoreLocation: true,
};

export default defineComponent<AutocompleteSearchProps>({
    name: 'PAutocompleteSearch',
    components: { PSearch, PContextMenu },
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
        focused: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
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

    },
    setup(props: AutocompleteSearchProps, { emit, slots, listeners }) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            proxyVisibleMenu: useProxyValue<boolean | undefined>('visibleMenu', props, emit),
            menuRef: null,
            proxyValue: makeOptionalProxy('value', vm, ''),
            isAutoMode: computed(() => props.visibleMenu === undefined),
            proxyIsFocused: makeOptionalProxy('isFocused', vm, props.focused),
            filteredMenu: [] as MenuItem[],
            bindingMenu: computed<MenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
            searchableItems: computed<MenuItem[]>(() => props.menu.filter((d) => d.type === undefined || d.type === 'item')),
            fuse: computed(() => new Fuse(state.searchableItems, fuseOptions)),
        });
        const {
            targetRef, targetElement, contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
            visibleMenu: toRef(state, 'proxyVisibleMenu'),
        });
        const contextMenuFixedStyleState = reactive({
            targetRef, targetElement, contextMenuStyle,
        });

        // const defaultHandler = (inputText: string, list: MenuItem[]) => {
        //     let results: MenuItem[] = [...list];
        //     const trimmed = inputText.trim();
        //     if (trimmed) {
        //         results = state.fuse.search(trimmed);
        //     }
        //     return { results };
        // };

        const defaultHandler = (inputText: string, list: MenuItem[]) => {
            let results: MenuItem[] = [...list];
            const trimmed = inputText.trim();
            if (trimmed) {
                const regex = new RegExp(inputText, 'i');
                results = results.filter((d) => regex.test(d.label as string));
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
                return !!results.find((d) => d.name === item.name);
            });
            if (filtered[filtered.length - 1]?.type === 'divider') filtered.pop();
            state.filteredMenu = filtered;
        };

        watch(() => props.menu, (menu) => {
            state.filteredMenu = menu;
            filterMenu(state.proxyValue);
        });

        const focusSearch = () => {
            state.proxyIsFocused = true;
        };

        const blurSearch = () => {
            state.proxyIsFocused = false;
        };

        const hideMenu = () => {
            if (state.isAutoMode) state.proxyVisibleMenu = false;
            emit('hide-menu');
        };

        const showMenu = () => {
            if (state.isAutoMode) state.proxyVisibleMenu = true;
            emit('show-menu');
        };

        const focusMenu = () => {
            if (state.bindingMenu.length === 0) return;
            showMenu();

            if (state.menuRef) state.menuRef.focus();
        };

        const allFocusOut = () => {
            blurSearch();
            hideMenu();
        };

        const onWindowKeydown = (e: KeyboardEvent) => {
            if (state.proxyVisibleMenu && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
            }
        };
        onMounted(() => {
            window.addEventListener('click', hideMenu);
            window.addEventListener('blur', hideMenu);
            window.addEventListener('keydown', onWindowKeydown, false);
        });
        onUnmounted(() => {
            window.removeEventListener('click', hideMenu);
            window.removeEventListener('blur', hideMenu);
            window.removeEventListener('keydown', onWindowKeydown, false);
        });

        const onFocusMenuItem = (idx: string) => {
            emit('focus-menu', idx);
        };

        const onSearchFocus = () => {
            filterMenu(state.proxyValue);
            showMenu();
        };

        const menuSlots = computed(() => reduce(slots, (res, d, name) => {
            if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
            return res;
        }, {}));

        const searchSlots = computed(() => reduce(slots, (res, d, name) => {
            if (name.startsWith('search-')) res[`${name.substring(7)}`] = d;
            return res;
        }, {}));

        const onInput = (val: string, e) => {
            if (!state.proxyVisibleMenu) showMenu();

            state.proxyValue = val;
            emit('input', val, e);

            filterMenu(val);
        };

        const emitSearch = (val?: string) => {
            emit('search', val);
        };

        const emitSelectMenu = (item: MenuItem) => {
            emit('select-menu', item);
        };

        const onClickMenuItem = (item: MenuItem) => {
            const name = item.name;
            state.proxyValue = item.label ?? name;
            emitSelectMenu(item);
            hideMenu();
        };

        const onSearch = (val?: string) => {
            const trimmed = val?.trim() ?? '';
            const menuItem = state.filteredMenu.find((d) => trimmed.toLowerCase() === d.label?.toLowerCase());
            if (menuItem) {
                emitSelectMenu(menuItem);
                state.proxyValue = menuItem.label;
            }

            if (!menuItem && props.exactMode) {
                state.proxyValue = '';
                emitSearch('');
            } else {
                emitSearch(trimmed);
            }

            vm.$nextTick(() => {
                allFocusOut();
            });
        };

        const onDelete = () => {
            emitSearch('');
            focusSearch();
        };

        const searchListeners = {
            ...listeners,
            keyup(e) {
                if (e.key === 'ArrowDown' || e.key === 'Down') focusMenu();
                else if (e.key === 'Escape' || e.key === 'Esc') allFocusOut();
                makeByPassListeners(listeners, 'keyup', e);
            },
            focus(e) {
                onSearchFocus();
                makeByPassListeners(listeners, 'focus', e);
            },
            click(e: MouseEvent) {
                e.stopPropagation();
                showMenu();
                makeByPassListeners(listeners, 'click', e);
            },
            delete(...args) {
                onDelete();
                makeByPassListeners(listeners, 'delete', args);
            },
            search: onSearch,
            input: onInput,
        };

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            allFocusOut,
            focusMenu,
            onClickMenuItem,
            focusSearch,
            blurSearch,
            showMenu,
            hideMenu,
            onFocusMenuItem,
            onSearchFocus,
            menuSlots,
            searchSlots,
            onInput,
            onDelete,
            onSearch,
            searchListeners,
        };
    },
});
</script>

<style lang="postcss">
.p-autocomplete-search {
    @apply w-full relative;
    .p-search {
        .input-container {
            @apply text-sm font-normal;
        }
    }
    .p-context-menu {
        @apply font-normal;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: 100%;
    }
}
</style>
