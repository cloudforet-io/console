<template>
    <div v-click-outside="hideMenu"
         class="p-query-search"
    >
        <p-search :class="{'no-menu': menu ? menu.length === 0 : false}"
                  :value="searchText"
                  :placeholder="placeholder"
                  :disable-icon="!!selectedKey"
                  :is-focused.sync="isFocused"
        >
            <template #left>
                <span v-for="(keyItem, idx) in selectedKeys"
                      :key="idx"
                      class="key-tag"
                      :class="{active: isFocused || visibleMenu}"
                >
                    {{ keyItem.label }}
                </span>
                <span v-if="operator"
                      class="operator-tag"
                >{{ operator }}</span>
            </template>
            <template #default="scope">
                <input ref="inputRef"
                       v-focus.lazy="isFocused"
                       :value="searchText"
                       :placeholder="currentPlaceholder || scope.placeholder"
                       :type="inputElType"
                       :step="currentDataType === 'integer' ? 1 : undefined"
                       :min="currentDataType === 'integer' ? 0 : undefined"
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
                    <span v-if="selectedKey || scope.value"
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
        <div v-show="visibleMenu && menu.length"
             class="menu-container"
        >
            <p-context-menu ref="menuRef"
                            :loading="lazyLoading"
                            :menu="menu"
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

<script lang="ts">
import type {
    PropType, SetupContext,
} from 'vue';
import {
    computed, defineComponent, reactive, toRef, toRefs,
} from 'vue';


import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
    reduce,
} from 'lodash';
import vClickOutside from 'v-click-outside';
import { focus as vFocus } from 'vue-focus';

import PI from '@/foundation/icons/PI.vue';
import { useQuerySearch } from '@/hooks/query-search';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { KeyMenuItem, ValueMenuItem } from '@/inputs/search/query-search/type';
import PSearch from '@/inputs/search/search/PSearch.vue';


dayjs.extend(utc);
dayjs.extend(timezone);

export default defineComponent({
    name: 'PQuerySearch',
    components: {
        PContextMenu,
        PSearch,
        PI,
    },
    directives: {
        focus: vFocus,
        clickOutside: vClickOutside.directive,
    },
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
        keyItemSets: {
            // FIXME:: below any type
            type: Array as PropType<any>,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, context: SetupContext) {
        const { slots, emit } = context;
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
                focused: props.focused,
                valueHandlerMap: toRef(props, 'valueHandlerMap'),
                keyItemSets: toRef(props, 'keyItemSets'),
                visibleMenu: toRef(state, 'visibleMenu'),
                value: toRef(state, 'value'),
            },
        );

        /* event */
        const onMenuSelect = async (item: KeyMenuItem | ValueMenuItem) => {
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

        return {
            ...toRefs(querySearchState),
            focus,
            blur,
            showMenu,
            hideMenu,
            onInput,
            onEnter,
            onKeydownCheck,
            onPaste,
            onDeleteAll,
            onMenuSelect,

            /* slots */
            menuSlots,
            searchSlots,
        };
    },
});
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
