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

import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/components/util/composition-helpers';
import {
    find,
} from 'lodash';
import { CONTEXT_MENU_TYPE, MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { OperatorType } from '@/lib/fluent-api';
import {
    KeyItem, QueryItem, QuerySearchProps, ValueItem,
} from '@/components/organisms/search/query-search/type';

interface MenuItem<T> extends ContextMenuItem {
    data?: T;
}

interface State {
    searchRef: any;
    visibleMenu: boolean;
    isFocused: boolean;
    proxyValue: string;
    selectedKey: KeyItem|null;
    operator: OperatorType;
    keyMenu: Readonly<MenuItem<KeyItem>[]>;
    valueMenu: Readonly<MenuItem<ValueItem>[]>;
    menu: Readonly<MenuItem<KeyItem|ValueItem>[]>;
}

export default {
    name: 'PQuerySearch',
    components: { PAutocompleteSearch },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: String,
            default: '',
            required: true,
        },
        placeholder: {
            type: String,
            default: 'Search',
        },
        focused: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        keyItems: {
            type: Array,
            default: () => [],
        },
        valueItems: {
            type: Array,
            default: () => [],
        },
        totalCount: {
            type: Number,
            default: 0,
        },
    },
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
                    label: `Key (${props.totalCount})`,
                    type: CONTEXT_MENU_TYPE.header,
                },
                ...props.keyItems.map(d => ({
                    label: d.label,
                    name: d.name,
                    type: CONTEXT_MENU_TYPE.item,
                    data: d,
                })),
            ]),
            valueMenu: computed(() => {
                if (state.selectedKey === null) return [];
                return [
                    {
                        label: `${state.selectedKey.label} (${props.totalCount})`,
                        type: CONTEXT_MENU_TYPE.header,
                    },
                    ...props.valueItems.map(d => ({
                        label: `${state.selectedKey?.label}:${state.operator} ${d.label}`,
                        name: d.name,
                        type: CONTEXT_MENU_TYPE.item,
                        data: d,
                    })),
                ];
            }),
            menu: computed(() => {
                if (state.selectedKey) return state.valueMenu;
                return state.keyMenu;
            }),
        });

        const findKey = (val: string): KeyItem|undefined => {
            const value = val.toLowerCase();
            const res = find(state.keyMenu,
                (item: MenuItem<KeyItem>) => (item.type === 'item'
                    && ((item.label && item.label.toLowerCase() === value)
                    || (item.name && item.name.toLowerCase() === value)))) as MenuItem<KeyItem>|null;

            return res ? res.data : undefined;
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

        const emitSearch = (val: ValueItem) => {
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
                state.selectedKey = findKey(val.substring(0, val.length - 1)) || null;
                if (state.selectedKey) emitKeySelect();
            } else emitKeyInput(val);
        };

        const onSearch = (val?: ValueItem|string|null) => {
            if (val !== undefined && val !== null) {
                if (typeof val === 'string') {
                    const str = val.trim();
                    emitSearch({ label: str, name: str });
                } else {
                    emitSearch(val);
                }
            }
        };

        const onMenuSelect = (value: string, idx: number) => {
            if (state.selectedKey) {
                const val = state.valueMenu[idx].data;
                onSearch(val);
            } else {
                const selected = state.keyMenu[idx];
                state.selectedKey = {
                    label: selected.label as string,
                    name: selected.name as string,
                };
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
