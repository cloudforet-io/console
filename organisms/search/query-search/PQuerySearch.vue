<template>
    <p-autocomplete-search ref="searchRef"
                           :value="searchText"
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
            <span v-if="operator" class="operator-tag">{{ operator }}</span>
        </template>
    </p-autocomplete-search>
</template>

<script lang="ts">

import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import {
    find, debounce,
} from 'lodash';
import { CONTEXT_MENU_TYPE, MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    KeyItem, OperatorType, QueryItem, QuerySearchProps, ValueItem,
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

const operators = ['!', '>', '>=', '<', '<=', '=', '!=', '$'];

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
        },
        placeholder: {
            type: String,
            default: 'Search',
        },
        focused: {
            type: Boolean,
            default: false,
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
                        label: `${state.selectedKey.label} (${state.valueTotalCount})`,
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

            if (!state.selectedKey && val) {
                const regex = RegExp(val, 'i');
                keyItems = props.keyItems.reduce((result, d) => {
                    if (regex.test(d.label) || regex.test(d.name)) result.push(d);
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

        const hideMenu = () => {
            state.visibleMenu = false;
            // state.valueTotalCount = 0;
            // state.filteredKeyItems = [];
            // state.filteredValueItems = [];
        };
        const focus = () => { state.isFocused = true; };
        const clearText = () => {
            state.searchText = '';
            state.operator = '';
        };


        const showMenu = async () => {
            if (state.selectedKey) await onValueInput(state.searchText);
            await onKeyInput(state.searchText);
            state.visibleMenu = true;
        };


        const onKeySelect = (keyItem: KeyItem) => {
            clearText();
            focus();
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

        const findAndSetKey = async (val: string) => {
            state.selectedKey = findKey(val.substring(0, val.length - 1)) || null;
            if (state.selectedKey) {
                onKeySelect(state.selectedKey);
                await onValueInput('');
            }
        };

        const setOperator = (operator: OperatorType) => {
            if (state.operator) {
                if (state.operator.length === 1 && !['=', '$'].includes(state.operator)) {
                    state.searchText = state.searchText.substring(0, state.searchText.length - 1);
                    state.operator += operator;
                }
            } else {
                state.searchText = state.searchText.substring(0, state.searchText.length - 1);
                state.operator = operator;
            }
        };


        const onInput = async (rawVal: string, e) => {
            const val = rawVal.trim();
            state.searchText = val;

            if (state.selectedKey) {
                if (val.length > 0 && val.length < 3 && operators.includes(e.data)) {
                    setOperator(e.data);
                }
                await onValueInput(state.searchText);
            } else if (val.length > 1 && e.data === ':') await findAndSetKey(val);
            else await onKeyInput(val);
        };

        const onSearch = (val?: ValueItem|string|null) => {
            if (val && typeof val === 'object') {
                emitSearch(val);
            } else {
                const str = typeof val === 'string' ? val.trim() : '';
                if (str || state.selectedKey) emitSearch({ label: str, name: str });
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

        const removeOperator = () => {
            if (state.operator.length === 2) state.operator = state.operator.substring(0, 1) as OperatorType;
            else state.operator = '';
        };

        const onDelete = async (e) => {
            if (e.target.value) return;

            if (state.operator) removeOperator();
            else if (state.selectedKey) {
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
.operator-tag {
    @apply mr-2;
    height: 1.125rem;
    line-height: 1.125rem;
}
</style>
