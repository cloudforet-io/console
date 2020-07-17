<template>
    <p-autocomplete-search ref="searchRef"
                           v-model="proxyValue"
                           :placeholder="placeholder"
                           :loading="loading"
                           :disable-icon="!!selectedKey"
                           :visible-menu.sync="visibleMenu"
                           :is-focused.sync="isFocused"
                           :menu="menu"
                           @menu:select="onMenuSelect"
                           @search="onSearch"
                           @input="onInput"
                           @keyup.esc="hideMenu"
                           @keydown.delete="onDelete"
                           @mousedown.stop="showMenu"
                           @menu:hide="hideMenu"
    >
        <template #search-left>
            <span v-if="selectedKey" class="key-tag"
                  :class="{active: isFocused || visibleMenu}"
            >{{ selectedKey.label }}</span>
        </template>
    </p-autocomplete-search>
</template>

<script lang="ts">

import {
    KeyItem,
    QueryItem,
    QuerySearchProps,
    querySearchProps,
} from '@/components/organisms/search/query-search/PQuerySearch.toolset';
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/components/utils/composition';
import {
    find,
} from 'lodash';
import { CONTEXT_MENU_TYPE, MenuItem } from '@/components/organisms/context-menu/context-menu/PContextMenu.toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { OperatorType } from '@/lib/fluent-api';


interface State {
    searchRef: any;
    visibleMenu: boolean;
    isFocused: boolean;
    proxyValue: string;
    selectedKey: KeyItem|null;
    operator: OperatorType;
    keyMenu: Readonly<MenuItem[]>;
    valueMenu: Readonly<MenuItem[]>;
    menu: Readonly<MenuItem[]>;
}

export default {
    name: 'PQuerySearch',
    components: { PAutocompleteSearch },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: querySearchProps,
    setup(props: QuerySearchProps, { emit }) {
        const state: UnwrapRef<State> = reactive({
            searchRef: null,
            visibleMenu: false,
            isFocused: props.focused,
            proxyValue: makeProxy('value', props, emit),
            selectedKey: null,
            operator: '',
            keyMenu: computed(() => [
                {
                    label: `Key (${props.keyItems.length})`,
                    type: CONTEXT_MENU_TYPE.header,
                },
                ...props.keyItems.map(d => ({
                    label: d.label,
                    name: d.name,
                    type: CONTEXT_MENU_TYPE.item,
                })),
            ]),
            valueMenu: computed(() => {
                if (state.selectedKey === null) return [];
                return [
                    {
                        label: `${state.selectedKey.label} (${props.valueItems.length})`,
                        type: CONTEXT_MENU_TYPE.header,
                    },
                    ...props.valueItems.map(d => ({
                        label: `${state.selectedKey?.label}:${state.operator} ${d}`,
                        name: d,
                        type: CONTEXT_MENU_TYPE.item,
                    })),
                ];
            }),
            menu: computed(() => {
                if (state.selectedKey) return state.valueMenu;
                return state.keyMenu;
            }),
        });

        const findKey = (val: string): null|KeyItem => {
            const res = find(state.keyMenu as unknown as KeyItem[],
                (item: KeyItem) => (item.label === val || item.name === val));
            return res || null;
        };

        const showMenu = () => {
            emit('menu:show', state.proxyValue, state.selectedKey);
            state.visibleMenu = true;
        };
        const hideMenu = () => { state.visibleMenu = false; };
        const focus = () => { state.isFocused = true; };

        const clearText = () => { state.proxyValue = ''; };

        const emitKeyInput = (val: string) => { emit('key:input', val); };
        const emitValueInput = (val: string) => { emit('value:input', val, state.selectedKey); };


        const emitKeySelect = () => {
            clearText();
            focus();
            emit('key:select', state.selectedKey);
        };

        const emitSearch = (val: string) => {
            emit('search', {
                key: state.selectedKey,
                value: val,
                operator: state.operator,
            } as QueryItem);
            clearText();
            state.selectedKey = null;
            hideMenu();
        };


        const onInput = (rawVal: string, e) => {
            const val = rawVal.trim();
            if (!state.visibleMenu) showMenu();

            if (state.selectedKey) emitValueInput(val);
            else if (val.length > 1 && e.data === ':') {
                state.selectedKey = findKey(val.substring(0, val.length - 1));
                if (state.selectedKey) emitKeySelect();
            } else emitKeyInput(val);
        };

        const onSearch = (val?: any) => {
            if (val !== undefined && val !== null) {
                if (typeof val === 'string') {
                    const str = val.trim();
                    emitSearch(str);
                } else {
                    emitSearch(val);
                }
            }
        };

        const onMenuSelect = (value: string, idx: number) => {
            if (state.selectedKey) {
                const val = state.valueMenu[idx].name as any;
                onSearch(val);
            } else {
                state.selectedKey = state.keyMenu[idx] as KeyItem;
                emitKeySelect();
                showMenu();
            }
        };

        const onDelete = (e) => {
            if (state.selectedKey && !e.target.value) {
                state.selectedKey = null;
                emitKeyInput('');
            }
        };


        return {
            ...toRefs(state),
            onInput,
            onMenuSelect,
            onSearch,
            showMenu,
            hideMenu,
            onDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
.key-tag {
    @apply bg-gray-200 rounded-sm px-2 text-xs mr-2;
    height: 1.125rem;
    line-height: 1.125rem;
    &.active {
        @apply bg-blue-300;
    }
}
</style>
