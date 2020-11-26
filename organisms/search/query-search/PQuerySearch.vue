<template>
    <p-autocomplete-search ref="searchRef"
                           class="p-query-search"
                           :class="{'no-menu': menu ? menu.length === 0 : false}"
                           :value="searchText"
                           :placeholder="placeholder"
                           :loading="loading"
                           :disable-icon="!!selectedKey"
                           :visible-menu.sync="visibleMenu"
                           :is-focused.sync="isFocused"
                           :menu="menu"
                           @select-menu="onMenuSelect"
                           @search="onSearch"
                           @input="onInput"
                           @keyup.esc="hideMenu"
                           @keydown.delete="onDelete"
                           @keydown="onKeydown"
                           @mousedown.stop="showMenu"
                           @hide-menu="hideMenu"
    >
        <template #search-left="scope">
            <span v-if="selectedKey" class="key-tag"
                  :class="{active: isFocused || visibleMenu}"
            >{{ selectedKey.label }}</span>
            <span v-if="operator" class="operator-tag">{{ operator }}</span>
        </template>
        <template #search-default="scope">
            <component :is="component" v-bind="scope" v-on="scope.inputListeners"
            />
        </template>
        <template #search-right="scope">
            <div class="right">
                <span v-if="selectedKey || scope.value" class="delete-btn" @click="onDeleteAll">
                    <p-i class="icon" name="ic_delete" height="1rem"
                         width="1rem"
                    />
                </span>
                <div class="separator" />
                <span class="help" @click="onHelpClick">{{ $t('COMPONENT.QUERY_SEARCH.HELP') }}</span>
                <p-query-search-guide v-model="visibleSearchGuide" />
            </div>
        </template>
        <template #menu-no-data>
            <div />
        </template>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot v-if="!excludeSlots.includes(slot)" :name="slot" v-bind="scope" />
        </template>
    </p-autocomplete-search>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { find, debounce } from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

/* Components, Directives */
import { focus as vFocus } from 'vue-focus';
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import PQuerySearchGuide from '@/components/organisms/search/query-search-guide/PQuerySearchGuide.vue';
import PI from '@/components/atoms/icons/PI.vue';

/* Types */
import { CONTEXT_MENU_TYPE, MenuItem as ContextMenuItem } from '@/components/organisms/context-menu/type';
import {
    HandlerResponse,
    KeyItem, OperatorType, QueryItem, QuerySearchProps, ValueItem,
} from '@/components/organisms/search/query-search/type';
import { Component } from 'vue';

/* Configs, Helpers */
import {
    formatterMap,
    lastOnlyOperatorChars,
    operatorChars,
    operatorCheckerMap, operatorMenuMap,
} from '@/components/organisms/search/query-search/config';
import { defaultValueHandler } from '@/components/organisms/search/query-search/helper';
import { makeByPassListeners } from '@/components/util/composition-helpers';


dayjs.extend(utc);
dayjs.extend(timezone);


interface MenuItem<T> extends ContextMenuItem {
    data?: T;
}

export default {
    name: 'PQuerySearch',
    components: { PI, PQuerySearchGuide, PAutocompleteSearch },
    directives: { focus: vFocus },
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
        const state = reactive({
            searchRef: null as null|Component,
            visibleMenu: false,
            isFocused: props.focused,
            loading: false,
            searchText: props.value,
            selectedKey: null as KeyItem|null,
            operator: '' as OperatorType,
            currentDataType: computed(() => state.selectedKey?.dataType || 'string'),
            keyTotalCount: computed(() => {
                if (state.selectedKey) return 0;
                return props.keyItems.length;
            }),
            valueTotalCount: 0 as undefined|number,
            filteredKeyItems: [] as KeyItem[],
            filteredValueItems: [] as ValueItem[],
            keyMenu: computed<MenuItem<KeyItem>[]>(() => [
                {
                    label: `Key (${state.keyTotalCount})`,
                    type: CONTEXT_MENU_TYPE.header,
                },
                ...state.filteredKeyItems.map(d => ({
                    label: d.label,
                    name: d.name,
                    type: CONTEXT_MENU_TYPE.item,
                    data: d,
                })),
            ]),
            valueMenu: computed<MenuItem<ValueItem>[]>(() => {
                if (state.selectedKey === null) return [];
                if (state.filteredValueItems.length > 0) {
                    return [
                        {
                            label: `${state.selectedKey.label} ${state.valueTotalCount === undefined ? '' : `(${state.valueTotalCount})`}`,
                            type: CONTEXT_MENU_TYPE.header,
                        },
                        ...state.filteredValueItems.map(d => ({
                            label: `${state.selectedKey?.label}:${state.operator} ${d.label}`,
                            name: d.name,
                            type: CONTEXT_MENU_TYPE.item,
                            data: d,
                        })),
                    ];
                }
                return [];
            }),
            menu: computed<MenuItem<KeyItem|ValueItem>[]>(() => {
                if (state.selectedKey) {
                    if (operatorMenuMap[state.selectedKey.dataType]) {
                        if (state.operator) return state.valueMenu;
                        return operatorMenuMap[state.selectedKey.dataType];
                    }
                    return state.valueMenu;
                }
                return state.keyMenu;
            }),
            visibleSearchGuide: false,
            component: null,
        });

        const loadComponent = async () => {
            try {
                state.component = () => import(`./templates/${state.selectedKey?.dataType || 'string'}/index.vue`);
            } catch (e) {
                state.component = () => import('./templates/string/index.vue');
            }
        };
        watch(() => state.selectedKey, async () => {
            await loadComponent();
        }, { immediate: true });

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
            let res: HandlerResponse = { results: [], totalCount: undefined };

            if (state.selectedKey) {
                const handler = props.valueHandlerMap[state.selectedKey.name] || defaultValueHandler;
                const func = handler(inputText, state.selectedKey);
                if (func instanceof Promise) {
                    res = await func;
                } else res = func;
            }

            state.valueTotalCount = res.totalCount;
            state.filteredValueItems = res.results;
        }, 150);

        const findKey = (val: string): KeyItem|undefined => {
            const value = val.toLowerCase();
            const res = find(state.keyMenu,
                (item: MenuItem<KeyItem>) => (item.type === 'item'
                    && ((item.label && item.label.toString().toLowerCase() === value)
                    || (item.name && item.name.toLowerCase() === value)))) as MenuItem<KeyItem>|null;

            return res ? res.data : undefined;
        };

        const hideMenu = () => { state.visibleMenu = false; };
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
            const queryItem = {
                key: state.selectedKey,
                value: val,
                operator: state.operator,
            } as QueryItem;

            if (queryItem.key?.dataType && formatterMap[queryItem.key.dataType]) {
                queryItem.value.name = formatterMap[queryItem.key.dataType](val.name);
            }

            emit('search', queryItem);
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

        const onInput = async (rawVal: string, e) => {
            const val = rawVal || ''; // rawVal.trim()
            state.searchText = val;

            if (state.selectedKey) {
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
                if (operatorMenuMap[state.selectedKey.dataType]) {
                    state.operator = value;
                    focus();
                } else {
                    const val = state.valueMenu[idx].data;
                    onSearch(val);
                }
            } else {
                const selected = state.keyMenu[idx];
                if (selected.data) {
                    state.selectedKey = selected.data;
                    onKeySelect(state.selectedKey);
                    showMenu();
                }
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

        const onDeleteAll = () => {
            state.selectedKey = null;
            state.searchText = '';
        };

        const onKeydown = (e: KeyboardEvent) => {
            if (!state.selectedKey) return;

            if (operatorChars[state.selectedKey.dataType || 'string'].includes(e.key)) {
                if (state.searchText.length > 0) return;
                if (state.operator.length === 0) {
                    state.operator = e.key;
                    e.preventDefault();
                } else if (state.operator.length === 1 && lastOnlyOperatorChars.includes(e.key)) {
                    state.operator += e.key;
                    e.preventDefault();
                }
            } else if (!['Backspace', 'Enter'].includes(e.key)) {
                const checker = operatorCheckerMap[state.selectedKey.dataType];
                if (checker && !checker(e.key)) e.preventDefault();
            }
        };

        const onHelpClick = () => {
            state.visibleSearchGuide = true;
        };

        const querySearchListeners = {
            input(e) {
                emit('update:value', e.target.value);
                makeByPassListeners(listeners, 'input', e.target.value, e);
            },
            blur(e) {
                state.proxyIsFocused = false;
                makeByPassListeners(listeners, 'blur', e);
            },
            focus(e) {
                state.proxyIsFocused = true;
                makeByPassListeners(listeners, 'focus', e);
            },
            keyup: (e) => {
                if (e.code === 'Enter') emit('search', props.value, e);
                makeByPassListeners(listeners, 'keyup', e);
            },
        };


        return {
            ...toRefs(state),
            onInput,
            onMenuSelect,
            onSearch,
            showMenu,
            hideMenu,
            onDelete,
            onDeleteAll,
            onKeydown,
            excludeSlots: ['search-left', 'search-default', 'menu-no-data', 'search-right'],
            onHelpClick,
            querySearchListeners,
        };
    },
};
</script>

<style lang="postcss">
.p-query-search {
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
    &.no-menu .p-context-menu {
        border-width: 0;
    }
    .right {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        .delete-btn {
            @apply cursor-pointer inline-block flex-shrink-0;
            position: relative;
            border-radius: 100px;
            height: 1rem;
            width: 1rem;
            &:hover {
                @apply bg-gray-200;
            }
            .icon {
                position: absolute;
            }
        }
        .separator {
            @apply border-l border-gray-300;
            height: 1rem;
            margin-left: 0.625rem;
            margin-right: 0.625rem;
        }
        .help {
            cursor: pointer;
            font-size: 0.75rem;
            margin-right: 0.125rem;
            &:hover { @apply text-secondary; }
        }
    }
}
</style>
