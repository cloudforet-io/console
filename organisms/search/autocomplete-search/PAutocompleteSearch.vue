<template>
    <div class="p-autocomplete-search">
        <p-search ref="searchRef" v-model="proxyValue"
                  :placeholder="placeholder"
                  :focused="focused"
                  :disable-icon="disableIcon"
                  :is-focused.sync="proxyIsFocused"
                  @keyup.down="focusMenu"
                  @keyup.esc="allFocusOut"
                  @focus="onSearchFocus"
                  @click.stop="showMenu"
                  v-on="$listeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{...scope}" />
            </template>
        </p-search>
        <template v-if="proxyVisibleMenu">
            <p-context-menu v-if="menu.length > 0" ref="menuRef"
                            theme="secondary"
                            :menu="menu"
                            :loading="loading"
                            @clickMenuEvent="onClickMenuItem"
                            @onEndOfUpKey="focusSearch"
                            @onEscKey="focusSearch"
                            @focus="onFocusMenuItem"
            />
            <slot v-else name="no-data" />
        </template>
    </div>
</template>

<script lang="ts">

import {
    autocompleteSearchProps,
    AutocompleteSearchProps,
} from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.toolset';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import {
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy, windowEventMount } from '@/lib/compostion-util';
import PSearch from '@/components/molecules/search/PSearch.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';

export default {
    name: 'PAutocompleteSearch',
    components: { PSearch, PContextMenu },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: autocompleteSearchProps,
    setup(props: AutocompleteSearchProps, { emit }) {
        const state: any = reactive({
            searchRef: null,
            menuRef: null,
            proxyValue: makeProxy('value', props, emit),
            isAutoMode: computed(() => props.visibleMenu === undefined),
            proxyVisibleMenu: props.visibleMenu === undefined
                ? false
                : makeProxy('visibleMenu', props, emit),
            proxyIsFocused: makeProxy('isFocused', props, emit),
        });

        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;

        const focusSearch = () => {
            if (state.searchRef) state.searchRef.focus();
        };

        const blurSearch = () => {
            if (state.searchRef) state.searchRef.blur();
        };

        const hideMenu = () => {
            if (state.isAutoMode) state.proxyVisibleMenu = false;
        };

        const showMenu = () => {
            if (state.isAutoMode) state.proxyVisibleMenu = true;
        };

        const focusMenu = () => {
            if (props.menu.length === 0) return;
            showMenu();
            if (state.menuRef) state.menuRef.focus();
        };

        const allFocusOut = () => {
            blurSearch();
            hideMenu();
        };

        const onClickMenuItem = (name, idx) => {
            if (vm.$listeners['menu:select']) emit('menu:select', props.menu[idx].label, idx);
            else {
                state.proxyValue = props.menu[idx].label;
                hideMenu();
            }
        };

        const windowMousedown = (e: MouseEvent) => {
            hideMenu();
            emit('window:click', e);
        };
        onMounted(() => window.addEventListener('click', windowMousedown));
        onUnmounted(() => window.removeEventListener('click', windowMousedown));

        const onFocusMenuItem = (idx: string) => {
            emit('menu:focus', idx);
        };

        const onSearchFocus = () => {
            showMenu();
        };

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
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
