<template>
    <div class="p-autocomplete-search">
        <p-search :search-text.sync="proxySearchText"
                  :search-placeholder="searchPlaceholder"
                  :focused.sync="proxySearchFocused"
                  @onSearch="onSearch(searchText)"
                  @onDownKey="focusMenu"
                  @onEscKey="allFocusOut"
                  v-on="$listeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{...scope, rootData}" />
            </template>
        </p-search>
        <p-context-menu v-if="proxyVisibleMenu" ref="menuRef"
                        theme="secondary"
                        :menu="menu"
                        :loading="loading"
                        @clickMenuEvent="onClickMenuItem"
                        @onEndOfUpKey="proxySearchFocused=true"
                        @onEscKey="proxySearchFocused=true"
        />
    </div>
</template>

<script lang="ts">

import {
    autocompleteSearchProps,
    AutocompleteSearchProps,
} from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.toolset';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy, windowEventMount } from '@/lib/compostion-util';
import PSearch from '@/components/molecules/search/Search.vue';

export default {
    name: 'PAutocompleteSearch',
    components: { PSearch, PContextMenu },
    model: {
        prop: 'searchText',
        event: 'update:searchText',
    },
    props: autocompleteSearchProps,
    setup(props: AutocompleteSearchProps, { emit }) {
        const state = reactive({
            menuRef: null,
            proxySearchText: computed({
                set: (val: string) => {
                    emit('update:searchText', val);
                    state.forceHideMenu = false;
                },
                get() { return props.searchText; },
            }),
            menuFocused: false,
            proxySearchFocused: props.searchFocused === undefined
                ? true
                : makeProxy('searchFocused', props, emit),
            proxyVisibleMenu: props.visibleMenu === undefined
                ? computed({
                    set(val) { state.menuFocused = val; },
                    get() {
                        if (state.forceHideMenu) return false;
                        if (state.menuFocused) return true;
                        return state.proxySearchFocused && props.menu.length !== 0;
                    },
                })
                : makeProxy('visibleMenu', props, emit),
            forceHideMenu: true,
        });


        const allFocusOut = () => {
            state.menuFocused = false;
            state.proxySearchFocused = false;
        };

        const focusMenu = () => {
            if (props.menu.length === 0) return;
            if (state.menuRef) {
                state.menuFocused = true;
                state.menuRef.focus();
            } else {
                state.forceHideMenu = false;
                state.menuFocused = true;
            }
        };

        const onSearch = (val: string) => {
            emit('search', val);
        };

        const hideMenu = () => {
            if (props.visibleMenu === undefined) state.proxyVisibleMenu = false;
        };

        const onClickMenuItem = (name, idx) => {
            state.proxySearchText = props.menu[idx].label;
            state.proxySearchFocused = true;
            hideMenu();
            emit('search', props.menu[idx].label);
            state.forceHideMenu = true;
        };

        windowEventMount('click', hideMenu);

        const vm: any = getCurrentInstance();


        return {
            ...toRefs(state),
            allFocusOut,
            focusMenu,
            onSearch,
            onClickMenuItem,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
