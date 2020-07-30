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
    find, debounce,
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
    loading: boolean;
    searchText: string;
    selectedKey: KeyItem|null;
    operator: OperatorType;
    totalCount: number;
    valueTotalCount: number;
    filteredKeyItems: KeyItem[];
    filteredValueItems: ValueItem[];
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
        keyItems: {
            type: Array,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: QuerySearchProps, { emit }) {
        const state: UnwrapRef<State> = reactive({
            searchRef: null,
            visibleMenu: false,
            isFocused: props.focused,
            loading: false,
            searchText: props.value,
            proxyValue: computed({
                get() { return state.searchText; },
                set(val) { emit('update:value', val); },
            }),
            selectedKey: null,
            operator: '',
            totalCount: computed(() => {
                if (state.selectedKey) return 0;
                return props.keyItems.length;
            }),
            valueTotalCount: 0,
            filteredKeyItems: [],
            filteredValueItems: [],
            keyMenu: computed(() => [
                {
                    label: `Key (${state.totalCount})`,
                    type: CONTEXT_MENU_TYPE.header,
                },
                ...state.filteredKeyItems.map(d => ({
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
                        label: `${state.selectedKey.label} (${state.totalCount})`,
                        type: CONTEXT_MENU_TYPE.header,
                    },
                    ...state.filteredValueItems.map(d => ({
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

        const onKeyInput = debounce(async (val: string) => {
            let keyItems: KeyItem[] = [...props.keyItems];

            if (!state.selectedKey && state.searchText) {
                const regex = RegExp(state.searchText, 'i');
                keyItems = props.keyItems.reduce((result, d) => {
                    if (regex.exec(d.label) || regex.exec(d.name)) result.push(d);
                    return result;
                }, [] as KeyItem[]);
            }

            state.filteredKeyItems = keyItems;
        }, 150);

        const onValueInput = debounce(async (inputText: string): Promise<void> => {
            if (state.selectedKey) {
                const handler = props.valueHandlerMap[state.selectedKey.name];
                if (handler) {
                    const res = await handler(inputText, state.selectedKey);
                    state.valueTotalCount = res.totalCount;
                    state.filteredValueItems = res.results;
                    return;
                }
            }

            state.valueTotalCount = 0;
            state.filteredValueItems = [];
        }, 150);

        const findKey = (val: string): KeyItem|undefined => {
            const value = val.toLowerCase();
            const res = find(state.keyMenu,
                (item: MenuItem<KeyItem>) => (item.type === 'item'
                    && ((item.label && item.label.toLowerCase() === value)
                    || (item.name && item.name.toLowerCase() === value)))) as MenuItem<KeyItem>|null;

            return res ? res.data : undefined;
        };

        const hideMenu = () => { state.visibleMenu = false; };
        const focus = () => { state.isFocused = true; };
        const clearText = () => { state.searchText = ''; };


        const showMenu = async () => {
            if (state.selectedKey) await onValueInput(state.searchText);
            await onKeyInput(state.searchText);
            state.visibleMenu = true;
        };


        const onKeySelect = async (keyItem: KeyItem) => {
            clearText();
            focus();
            // const handler = props.valueHandlerMap[keyItem.name];
            // if (handler) {
            //     console.debug('onKeySelect: value handler execute')
            //     const res = await handler('', keyItem);
            //     state.filteredValueItems = res.results;
            //     state.valueTotalCount = res.totalCount;
            // } else {
            //     state.filteredValueItems = [];
            //     state.valueTotalCount = 0;
            // }
        };

        const emitSearch = (val: ValueItem) => {
            emit('search', {
                key: state.selectedKey,
                value: val,
                operator: state.operator,
            } as QueryItem);
            clearText();
            if (state.selectedKey) {
                state.selectedKey = null;
                hideMenu();
            }
        };


        const onInput = async (rawVal: string, e) => {
            state.searchText = rawVal;
            const val = rawVal.trim();
            // if (!state.visibleMenu) state.visibleMenu = true;

            if (state.selectedKey) await onValueInput('');
            else if (val.length > 1 && e.data === ':') {
                state.selectedKey = findKey(val.substring(0, val.length - 1)) || null;
                if (state.selectedKey) await onKeySelect(state.selectedKey);
            } else await onKeyInput(val);
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
                onKeySelect(state.selectedKey);
                showMenu();
            }
        };

        const onDelete = async (e) => {
            if (state.selectedKey && !e.target.value) {
                state.selectedKey = null;
                await onKeyInput('');
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
