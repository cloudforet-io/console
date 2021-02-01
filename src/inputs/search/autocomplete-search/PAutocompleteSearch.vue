<template>
    <div class="p-autocomplete-search">
        <p-search ref="searchRef"
                  v-model="proxyValue"
                  :placeholder="placeholder"
                  :focused="focused"
                  :disable-icon="disableIcon"
                  :is-focused.sync="proxyIsFocused"
                  v-on="searchListeners"
        >
            <template v-for="(_, slot) of searchSlots" v-slot:[slot]="scope">
                <slot :name="`search-${slot}`" v-bind="{...scope}" />
            </template>
        </p-search>
        <div v-if="proxyVisibleMenu" class="menu-container">
            <p-context-menu ref="menuRef"
                            theme="secondary"
                            :menu="filteredMenu"
                            :loading="loading"
                            @select="onClickMenuItem"
                            @keyup:up:end="focusSearch"
                            @keyup:esc="focusSearch"
                            @focus="onFocusMenuItem"
            >
                <template v-for="(_, slot) of menuSlots" v-slot:[slot]="scope">
                    <slot :name="`menu-${slot}`" v-bind="scope" />
                </template>
            </p-context-menu>
        </div>
    </div>
</template>

<script lang="ts">

import {
    AutocompleteSearchProps,
} from '@/inputs/search/autocomplete-search/type';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import {
    computed, onMounted, onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import { makeByPassListeners, makeProxy } from '@/util/composition-helpers';
import PSearch from '@/inputs/search/search/PSearch.vue';
import { reduce } from 'lodash';

export default {
    name: 'PAutocompleteSearch',
    components: { PSearch, PContextMenu },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
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
        disableIcon: {
            type: Boolean,
            default: false,
        },
        menu: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        isFocused: {
            type: Boolean,
            default: undefined,
        },
        handler: {
            type: Function,
            default: null,
        },
    },
    setup(props: AutocompleteSearchProps, { emit, slots, listeners }) {
        const state: any = reactive({
            searchRef: null,
            menuRef: null,
            proxyValue: listeners['update:value'] ? makeProxy('value', props, emit) : '',
            isAutoMode: computed(() => props.visibleMenu === undefined),
            proxyVisibleMenu: props.visibleMenu === undefined
                ? false
                : makeProxy('visibleMenu', props, emit),
            proxyIsFocused: makeProxy('isFocused', props, emit),
            filteredMenu: props.handler ? [] : computed(() => props.menu),
        });

        const focusSearch = () => {
            if (state.searchRef) state.searchRef.focus();
        };

        const blurSearch = () => {
            if (state.searchRef) state.searchRef.blur();
        };

        const hideMenu = () => {
            if (state.isAutoMode) state.proxyVisibleMenu = false;
            emit('hide-menu');
        };

        const showMenu = () => {
            if (state.isAutoMode) state.proxyVisibleMenu = true;
        };

        const focusMenu = () => {
            if (state.filteredMenu.length === 0) return;
            showMenu();
            if (state.menuRef) state.menuRef.focus();
        };

        const allFocusOut = () => {
            blurSearch();
            hideMenu();
        };

        const onWindowKeydown = (e: KeyboardEvent) => {
            if (state.proxyVisibleMenu && ['ArrowDown', 'ArrowUp'].includes(e.code)) {
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

        const onInput = async (val: string, e) => {
            if (!state.proxyVisibleMenu) showMenu();

            state.proxyValue = val;
            emit('input', val, e);

            if (props.handler) {
                const res = await props.handler(val);
                state.filteredMenu = res.results;
            }
        };

        const emitSearch = (val?: string) => {
            emit('search', val);
        };

        const onSearch = (val?: string) => {
            emitSearch(val);
            hideMenu();
        };

        const onClickMenuItem = (name, idx) => {
            if (listeners['select-menu']) {
                state.proxyValue = name;
                emit('select-menu', name, idx);
                hideMenu();
            } else {
                state.proxyValue = state.filteredMenu[idx].label;
                emitSearch(name);
                hideMenu();
            }
        };

        const init = async () => {
            if (props.handler) {
                const res = await props.handler('');
                state.filteredMenu = res.results;
            }
        };

        const onDelete = () => {
            emitSearch('');
            focusSearch();
        };

        const searchListeners = {
            ...listeners,
            keyup(e) {
                if (e.code === 'ArrowDown') focusMenu();
                else if (e.code === 'Escape') allFocusOut();
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

        init();

        return {
            ...toRefs(state),
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
};
</script>

<style lang="postcss">
.p-autocomplete-search {
    @apply w-full relative;
    .p-search {
        @apply text-sm font-normal;
    }
    .menu-container {
        @apply w-full relative;
    }
    .p-context-menu {
        @apply font-normal;
        min-width: unset;
        .secondary {
            &.context-header {
                @apply text-secondary;
            }
            &.context-item {
                &:hover {
                    @apply bg-blue-200;
                    color: currentColor !important;
                }
                &:focus {
                    @apply bg-blue-200;
                    color: currentColor !important;
                }
                &:active {
                    @apply bg-blue-200;
                    color: currentColor !important;
                }
            }
        }
    }
}
</style>
