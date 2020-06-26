<template>
    <div class="p-autocomplete-search">
        <p-search ref="searchRef" v-model="proxyValue"
                  :placeholder="placeholder"
                  :focused="focused"
                  @keyup.down="focusMenu"
                  @keyup.esc="allFocusOut"
                  @focus="onSearchFocus"
                  v-on="$listeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{...scope}" />
            </template>
        </p-search>
        <template v-if="visibleMenu">
            <p-context-menu v-if="menu.length > 0" ref="menuRef"
                            theme="secondary"
                            :menu="menu"
                            :loading="loading"
                            @clickMenuEvent="onClickMenuItem"
                            @onEndOfUpKey="focusSearch"
                            @onEscKey="focusSearch"
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
            visibleMenu: false,
        });

        const focusSearch = () => {
            if (state.searchRef) state.searchRef.focus();
        };

        const blurSearch = () => {
            if (state.searchRef) state.searchRef.blur();
        };

        const onSearchFocus = () => {
            state.visibleMenu = true;
        };


        const focusMenu = () => {
            if (props.menu.length === 0) return;
            state.visibleMenu = true;
            if (state.menuRef) {
                state.menuRef.focus();
            }
        };

        const hideMenu = () => {
            state.visibleMenu = false;
        };

        const showMenu = () => {
            state.visibleMenu = true;
        };

        const allFocusOut = () => {
            blurSearch();
            hideMenu();
        };

        const onClickMenuItem = (name, idx) => {
            state.proxyValue = props.menu[idx].label;
            hideMenu();
            emit('search', props.menu[idx].label);
        };

        onMounted(() => window.addEventListener('mousedown', hideMenu));
        onUnmounted(() => window.removeEventListener('mousedown', hideMenu));

        const vm: any = getCurrentInstance();


        return {
            ...toRefs(state),
            allFocusOut,
            focusMenu,
            onClickMenuItem,
            onSearchFocus,
            focusSearch,
            blurSearch,
            showMenu,
            hideMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
