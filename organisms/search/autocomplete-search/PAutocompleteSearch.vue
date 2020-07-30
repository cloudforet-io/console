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
    autocompleteSearchProps,
    AutocompleteSearchProps,
} from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.toolset';
import PContextMenu from '@/components/organisms/context-menu/PContextMenu.vue';
import {
    computed, onMounted, onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import { makeByPassListeners, makeProxy } from '@/components/util/composition-helpers';
import PSearch from '@/components/molecules/search/PSearch.vue';
import { reduce } from 'lodash';

export default {
    name: 'PAutocompleteSearch',
    components: { PSearch, PContextMenu },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: autocompleteSearchProps,
    setup(props: AutocompleteSearchProps, { emit, slots, listeners }) {
        const state: any = reactive({
            searchRef: null,
            menuRef: null,
            proxyValue: props.value !== undefined ? makeProxy('value', props, emit) : '',
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
            emit('menu:hide');
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
            emit('menu:focus', idx);
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

            if (props.handler) {
                const res = await props.handler(val);
                state.filteredMenu = res.results;
            }
            emit('input', val, e);
        };

        const emitSearch = (val?: string) => {
            emit('search', val);
        };

        const onSearch = (val?: string) => {
            emitSearch(val);
            hideMenu();
        };

        const onClickMenuItem = (name, idx) => {
            if (listeners['menu:select']) {
                emit('menu:select', name, idx);
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
            delete: onDelete,
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

<style lang="postcss" scoped>
    .p-autocomplete-search {
        @apply w-full relative;
        .p-search {
            @apply text-sm font-normal;
        }
        .menu-container {
            @apply w-full relative;
        }
        .p-context-menu::v-deep {
            @apply w-full font-normal;
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
