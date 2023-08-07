<template>
    <div ref="containerRef"
         class="p-query-search"
    >
        <p-search v-model:is-focused="isFocused"
                  :class="{'no-menu': querySearchState.menu ? querySearchState.menu.length === 0 : false}"
                  :value="querySearchState.searchText"
                  :placeholder="placeholder"
                  :disable-icon="!!querySearchState.selectedKey"
        >
            <template #left>
                <span v-for="(keyItem, idx) in querySearchState.selectedKeys"
                      :key="idx"
                      class="key-tag"
                      :class="{active: isFocused || state.visibleMenu}"
                >
                    {{ keyItem.label }}
                </span>
                <span v-if="querySearchState.operator"
                      class="operator-tag"
                >{{ querySearchState.operator }}</span>
            </template>
            <template #default="scope">
                <input ref="inputRef"
                       :value="querySearchState.searchText"
                       :placeholder="querySearchState.currentPlaceholder || scope.placeholder"
                       :type="querySearchState.inputElType"
                       :step="querySearchState.currentDataType === 'integer' ? 1 : undefined"
                       :min="querySearchState.currentDataType === 'integer' ? 0 : undefined"
                       @input="onInput"
                       @keyup.enter="onEnter"
                       @keydown="onKeydownCheck"
                       @click.stop="showMenu(true)"
                       @focus="focus"
                       @blur="blur"
                       @paste="onPaste"
                >
            </template>
            <template #right="scope">
                <div class="right">
                    <span v-if="querySearchState.selectedKey || scope.value"
                          class="delete-btn"
                          @click="onDeleteAll"
                    >
                        <p-i class="icon"
                             name="ic_close"
                             height="1rem"
                             width="1rem"
                        />
                    </span>
                </div>
            </template>
            <template v-for="(_, slot) of searchSlots"
                      #[slot]="scope"
            >
                <slot :name="`search-${slot}`"
                      v-bind="{...scope}"
                />
            </template>
        </p-search>
        <div v-show="state.visibleMenu && querySearchState.menu.length"
             class="menu-container"
        >
            <p-context-menu ref="menuRef"
                            :loading="querySearchState.lazyLoading"
                            :menu="querySearchState.menu"
                            no-select-indication
                            @keyup:up:end="focus"
                            @keyup:down:end="focus"
                            @select="onMenuSelect"
                            @blur="focus"
            >
                <template v-for="(_, slot) of menuSlots"
                          #[slot]="scope"
                >
                    <slot :name="`menu-${slot}`"
                          v-bind="{...scope}"
                    />
                </template>
            </p-context-menu>
        </div>
    </div>
</template>

<script setup lang="ts">


import { useFocus, onClickOutside } from '@vueuse/core';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
    reduce,
} from 'lodash';
import {
    computed, reactive, toRef, useSlots, ref,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';
import { useQuerySearch } from '@/hooks/query-search';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type {
    KeyMenuItem, ValueMenuItem, KeyItemSet, ValueHandlerMap,
} from '@/inputs/search/query-search/type';
import PSearch from '@/inputs/search/search/PSearch.vue';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
    value: string;
    placeholder: string;
    focused: boolean;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
}

const props = withDefaults(defineProps<Props>(), {
    value: '',
    placeholder: undefined,
    focused: false,
    keyItemSets: () => [],
    valueHandlerMap: () => ({}),
});
const emit = defineEmits(['update:value', 'search']);
const slots = useSlots();

/* on click outside */
const containerRef = ref<HTMLElement|null>(null);

const inputRef = ref<HTMLInputElement|null>(null);
const { focused: isFocused } = useFocus(inputRef);

const menuRef = ref<HTMLElement|null>(null);

const state = reactive({
    visibleMenu: false,
    value: props.value,
});
const {
    state: querySearchState,
    focus, blur, hideMenu, showMenu,
    onInput,
    onKeydownCheck,
    onKeyupEnter,
    onPaste,
    onDeleteAll,
    preTreatSelectedMenuItem,
} = useQuerySearch(
    {
        focused: props.focused || isFocused,
        valueHandlerMap: toRef(props, 'valueHandlerMap'),
        keyItemSets: toRef(props, 'keyItemSets'),
        visibleMenu: toRef(state, 'visibleMenu'),
        value: toRef(state, 'value'),
    },
);

/* event */
const onMenuSelect = async (_item: MenuItem) => {
    const item = _item as KeyMenuItem | ValueMenuItem;
    const queryItem = await preTreatSelectedMenuItem(item);
    if (queryItem) emit('search', queryItem);
};
const onEnter = async () => {
    const queryItem = await onKeyupEnter();
    if (queryItem) emit('search', queryItem);
};

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

onClickOutside(containerRef, hideMenu);

</script>

<style lang="postcss">
.p-query-search {
    @apply w-full;
    .p-search {
        .input-container {
            @apply text-sm font-normal;
        }
    }
    .menu-container {
        @apply w-full relative;
    }
    .p-context-menu {
        @apply font-normal;
        max-width: 100%;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: auto;
        width: auto;
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
            @apply cursor-pointer inline-block flex-shrink-0 rounded-full;
            position: relative;
            height: 1rem;
            width: 1rem;
            &:hover {
                @apply bg-gray-200;
            }
            .icon {
                position: absolute;
            }
        }
    }
}
</style>
