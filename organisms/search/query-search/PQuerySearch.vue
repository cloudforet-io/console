<template>
    <div class="p-query-search">
        <p-search :class="{'no-menu': menu ? menu.length === 0 : false}"
                  :value="searchText"
                  :placeholder="placeholder"
                  :disable-icon="!!selectedKey"
                  :visible-menu.sync="visibleMenu"
                  :is-focused.sync="isFocused"
        >
            <template #left="scope">
                <span v-for="(keyItem, idx) in selectedKeys" :key="idx" class="key-tag"
                      :class="{active: isFocused || visibleMenu}"
                >
                    {{ keyItem.label }}
                </span>
                <span v-if="operator" class="operator-tag">{{ operator }}</span>
            </template>
            <template #default="scope">
                <input ref="inputRef" v-focus.lazy="isFocused"
                       :value="searchText"
                       :placeholder="currentPlaceholder || scope.placeholder"
                       :type="inputElType"
                       :step="currentDataType === 'integer' ? 1 : undefined"
                       :min="currentDataType === 'integer' ? 0 : undefined"
                       @input="onInput"
                       @keydown.esc="leaveSearch"
                       @keydown.down="focusMenu"
                       @keydown.delete="onDelete"
                       @keyup.enter="onEnter"
                       @keydown="onKeydownCheck"
                       @click.stop="showMenu(true)"
                       @focus="focus"
                       @blur="blur"
                >
            </template>
            <template #right="scope">
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
            <template v-for="(_, slot) of searchSlots" v-slot:[slot]="scope">
                <slot :name="`search-${slot}`" v-bind="{...scope}" />
            </template>
        </p-search>
        <p-context-menu v-show="visibleMenu"
                        ref="menuRef"
                        theme="secondary"
                        :menu="menu"
                        @select="onMenuSelect"
                        @blur="focus"
        >
            <template #no-data>
                <div />
            </template>
            <template v-for="(_, slot) of menuSlots" v-slot:[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="{...scope}" />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, toRefs, watch, WatchStopHandle,
} from '@vue/composition-api';
import {
    throttle, reduce, cloneDeep, findLastIndex,
} from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

/* Components, Directives */
import { focus as vFocus } from 'vue-focus';
import PQuerySearchGuide from '@/components/organisms/search/query-search-guide/PQuerySearchGuide.vue';
import PI from '@/components/atoms/icons/PI.vue';

/* Types */
import {
    HandlerResponse,
    KeyItem,
    KeyMenuItem,
    operators,
    OperatorType,
    QuerySearchProps,
    ValueHandler,
    ValueItem,
    ValueMenuItem, MenuType, QueryItem, KeyDataType, dataTypes,
} from '@/components/organisms/search/query-search/type';

/* Configs, Helpers */
import {
    defaultHandlerMap,
    formatterMap, inputTypeMap, inputValidatorMap, menuTypeMap,
    placeholderMap, supportOperatorMap,
} from '@/components/organisms/search/query-search/config';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PContextMenu from '@/components/organisms/context-menu/PContextMenu.vue';
import {
    findKey,
    getDefaultKeyItemHandler, getKeyMenuForm,
    getValueItem, getValueMenuForm,
} from '@/components/organisms/search/query-search/helper';


dayjs.extend(utc);
dayjs.extend(timezone);


export default {
    name: 'PQuerySearch',
    components: {
        PContextMenu,
        PSearch,
        PI,
        PQuerySearchGuide,
    },
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
    setup(props: QuerySearchProps, { emit, slots }) {
        const state = reactive({
            /* Input */
            inputRef: null as null|HTMLElement,
            isFocused: props.focused,
            searchText: props.value,
            currentPlaceholder: computed(() => placeholderMap[state.currentDataType] || undefined),
            inputElType: computed(() => inputTypeMap[state.currentDataType] || 'text'),
            currentDataType: computed<KeyDataType|string>(() => {
                if (state.selectedKeys.length > 1) return state.handlerResp.dataType || '';
                if (state.rootKey) return state.rootKey.dataType || '';
                return '';
            }),

            /* Query */
            selectedKeys: [] as KeyItem[],
            subPath: computed<string|undefined>(() => state.selectedKeys.slice(1).map(d => d.name).join('.') || undefined),
            selectedKey: computed<KeyItem|null>(() => state.selectedKeys[state.selectedKeys.length - 1] || null),
            rootKey: computed<KeyItem|null>(() => state.selectedKeys[0] || null),
            operator: '' as OperatorType,
            supportOperators: computed<OperatorType[]>(() => {
                if (supportOperatorMap[state.currentDataType]) return supportOperatorMap[state.currentDataType];
                if (state.handlerResp.operators) return state.handlerResp.operators;
                if (state.rootKey?.operators) return state.rootKey.operators;
                return operators;
            }),

            /* Menu */
            menuRef: null as any,
            visibleMenu: false,
            menuType: computed<MenuType>(() => {
                if (!state.selectedKey || state.currentDataType === 'object') return 'KEY';
                return menuTypeMap[state.currentDataType] || 'VALUE';
            }),
            menu: computed<Array<KeyMenuItem|ValueMenuItem>>(() => {
                if (state.menuType === 'KEY') return getKeyMenuForm(state.handlerResp, state.selectedKeys, state.subPath);
                if (state.menuType === 'VALUE') return getValueMenuForm(state.handlerResp, state.selectedKeys, state.operator, state.subPath);
                return state.handlerResp.results.map(d => ({ ...d, type: 'item', data: d }));
            }),

            /* Handler */
            handler: computed<ValueHandler|null>(() => {
                if (!state.rootKey) return getDefaultKeyItemHandler(props.keyItems);
                return defaultHandlerMap[state.currentDataType]
                    || props.valueHandlerMap[state.rootKey.name]
                    || null;
            }),
            handlerResp: { results: [] } as HandlerResponse,


            /* help */
            visibleSearchGuide: false,
        });

        /* Control Input & Menu */
        const focus = () => { state.isFocused = true; };
        const blur = () => { state.isFocused = false; };
        const hideMenu = () => { state.visibleMenu = false; };
        const showMenu = async (refresh = false) => {
            state.visibleMenu = true;
            // eslint-disable-next-line no-use-before-define
            if (refresh) await updateMenuItems(state.searchText);
        };

        let offMenuFocusWatch: WatchStopHandle|undefined;
        const focusMenu = async () => {
            if (!state.visibleMenu) await showMenu(true);
            if (state.menuRef) state.menuRef.focus();
            else {
                if (offMenuFocusWatch) offMenuFocusWatch();
                offMenuFocusWatch = watch(() => state.menuRef, (menuRef) => {
                    if (menuRef) {
                        menuRef.focus();
                        if (offMenuFocusWatch) offMenuFocusWatch();
                    }
                });
            }
        };

        const leaveSearch = () => {
            blur();
            hideMenu();
        };

        const clearAll = () => {
            state.searchText = '';
            state.operator = '';
        };


        const updateSelectedKey = (item: KeyItem|null, replace = false) => {
            if (replace) {
                if (item) state.selectedKeys = [item];
                else state.selectedKeys = [];
            } else if (item) state.selectedKeys.push(item);
            else state.selectedKeys.pop();
        };


        const updateMenuItems = throttle(async (inputText: string): Promise<void> => {
            let res: HandlerResponse = { results: [] };

            if (state.handler) {
                const func = state.handler(inputText, state.selectedKey as KeyItem, state.subPath, state.operator);
                if (func instanceof Promise) {
                    res = await func;
                } else res = func;
            }

            state.handlerResp = res;
        }, 150);


        const findAndSetKey = async (val: string) => {
            let item = findKey(val, state.handlerResp.results) || null;
            if (!item && state.currentDataType === 'object') item = { label: val, name: val };
            if (item) {
                updateSelectedKey(item);
                clearAll();
                focus();
                await updateMenuItems('');
            }
        };


        const removeOperator = () => {
            if (state.operator.length === 2) state.operator = state.operator.substring(0, 1) as OperatorType;
            else state.operator = '';
        };

        /* Event triggers */
        const emitSearch = (val?: ValueItem|string|null) => {
            const valueItem = getValueItem(val, state.selectedKey);
            if (!valueItem) return;

            let queryItem = {
                key: state.rootKey,
                value: valueItem,
                operator: state.operator,
                subPath: state.subPath,
            } as QueryItem;

            if (formatterMap[state.currentDataType]) {
                queryItem = formatterMap[state.currentDataType](cloneDeep(queryItem));
            }

            emit('search', queryItem);

            clearAll();
            if (state.selectedKey) updateSelectedKey(null, true);
            hideMenu();
        };


        /* Event handlers */
        const onInput = async (e) => {
            const val = e.target.value || '';
            state.searchText = val;

            if (!state.visibleMenu) await showMenu();

            if (val.length > 1 && e.data === ':' && (!state.selectedKey || state.currentDataType === 'object')) await findAndSetKey(val.slice(0, val.length - 1));
            else await updateMenuItems(val);
        };

        const onDelete = async (e) => {
            if (e.target.value) return;

            if (state.operator) removeOperator();
            else if (state.selectedKey) {
                updateSelectedKey(null);
                await updateMenuItems('');
            }
        };

        const onEnter = () => {
            if (state.currentDataType !== 'object') emitSearch(state.searchText);
        };

        const onKeydownCheck = (e: KeyboardEvent) => {
            if (state.searchText.length > 0 || !state.selectedKey) return;

            /* check operator */
            const op = state.operator + e.key;
            if (state.supportOperators.some(d => d.startsWith(op))) {
                state.operator += e.key;
                e.preventDefault();
            } else if (!state.supportOperators.includes(state.operator)) state.operator = '';

            /* value validation */
            if (inputValidatorMap[state.currentDataType]) {
                const validator = inputValidatorMap[state.currentDataType];
                if (!validator(e.key)) e.preventDefault();
            }
        };

        const onDeleteAll = () => {
            updateSelectedKey(null, true);
            clearAll();
            focus();
        };

        const onMenuSelect = async (value: string, idx: number) => {
            const selected = state.menu[idx];

            if (!state.selectedKey || state.currentDataType === 'object') {
                updateSelectedKey(selected.data as KeyItem);
                clearAll();
                focus();
                await showMenu(true);
                await updateMenuItems(state.searchText);
            } else if (state.menuType === 'OPERATOR') {
                if (state.supportOperators.includes(value)) {
                    state.operator = value;
                    focus();
                    hideMenu();
                }
            } else emitSearch(selected.data as ValueItem);
        };


        /* Help */
        const onHelpClick = () => {
            state.visibleSearchGuide = true;
        };

        /* Window Events Binding */
        const onWindowKeydown = (e: KeyboardEvent) => {
            if (state.visibleMenu && ['ArrowDown', 'ArrowUp'].includes(e.code)) {
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


        /* Slots */
        const menuSlots = computed(() => reduce(slots, (res, d, name) => {
            if (name.startsWith('menu-') && !['menu-no-data'].includes(name)) {
                res[`${name.substring(5)}`] = d;
            }
            return res;
        }, {}));

        const searchSlots = computed(() => reduce(slots, (res, d, name) => {
            if (name.startsWith('search-') && !['search-left', 'search-default', 'search-right'].includes(name)) {
                res[`${name.substring(7)}`] = d;
            }
            return res;
        }, {}));

        return {
            ...toRefs(state),
            focus,
            blur,
            showMenu,
            hideMenu,
            focusMenu,
            leaveSearch,
            updateMenuItems,
            emitSearch,
            onInput,
            onDelete,
            onEnter,
            onKeydownCheck,
            onDeleteAll,
            onMenuSelect,

            /* help */
            onHelpClick,

            /* slots */
            menuSlots,
            searchSlots,
        };
    },
};
</script>

<style lang="postcss">
.p-query-search {
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
    &.no-menu .p-context-menu {
        border-width: 0;
    }
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
