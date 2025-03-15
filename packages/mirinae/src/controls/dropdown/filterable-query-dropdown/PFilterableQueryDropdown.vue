<template>
    <div v-click-outside="hideMenu"
         class="p-filterable-query-dropdown"
    >
        <p-search ref="targetRef"
                  :class="{'no-menu': querySearchState.menu ? querySearchState.menu.length === 0 : false}"
                  :value="querySearchState.searchText"
                  :placeholder="placeholder ? placeholder : 'Select Key: value'"
                  disable-icon
                  :is-focused.sync="querySearchState.isFocused"
        >
            <template #default="scope">
                <p-tag v-for="(selectedItem, index) in proxySelected"
                       :key="`tag-box-${index}`"
                       :key-item="selectedItem.key"
                       :value-item="selectedItem.value"
                       @delete="onDeleteTag(selectedItem, index)"
                />
                <span class="input-set">
                    <span v-for="(keyItem, idx) in querySearchState.selectedKeys"
                          :key="idx"
                          class="key-tag"
                    >
                        {{ keyItem.label }}:
                    </span>
                    <input ref="inputRef"
                           v-focus.lazy="querySearchState.isFocused"
                           class="input-element"
                           :value="querySearchState.searchText"
                           :placeholder="querySearchState.currentPlaceholder || scope.placeholder"
                           :type="querySearchState.inputElType"
                           :step="querySearchState.currentDataType === 'integer' ? 1 : undefined"
                           :min="querySearchState.currentDataType === 'integer' ? 0 : undefined"
                           :size="1"
                           @input="onInput"
                           @keyup.enter="onEnter"
                           @keydown="onKeydownCheck"
                           @click.stop="showMenu(true)"
                           @focus="focus"
                           @blur="blur"
                           @paste="onPaste"
                    >
                </span>
            </template>
            <template #right="scope">
                <div class="right">
                    <span v-if="querySearchState.selectedKey || scope.value"
                          class="delete-button"
                          @click="onDeleteAll"
                    >
                        <p-i class="icon"
                             name="ic_close"
                             height="1rem"
                             width="1rem"
                        />
                    </span>
                    <span class="dropdown-button"
                          :class="{'text-blue-600': querySearchState.isFocused}"
                          @click="handleClickDropdownButton"
                    >
                        <p-i class="icon"
                             :name="proxyVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                             color="inherit"
                        />
                    </span>
                </div>
            </template>
        </p-search>
        <p-context-menu v-show="proxyVisibleMenu"
                        ref="menuRef"
                        :loading="querySearchState.lazyLoading"
                        :menu="querySearchState.menu"
                        :highlight-term="querySearchState.searchText"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        no-select-indication
                        @keyup:up:end="focus"
                        @keyup:down:end="focus"
                        @select="onMenuSelect"
                        @blur="focus"
        />
    </div>
</template>

<script lang="ts">
import type {
    PropType, DirectiveFunction,
} from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs, toRef,
} from 'vue';

import { vOnClickOutside } from '@vueuse/components';
import { focus as vFocus } from 'vue-focus';

import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { SelectDropdownMenuItem } from '@/controls/dropdown/select-dropdown/type';
import type { KeyMenuItem, ValueMenuItem, QueryItem } from '@/controls/search/query-search/type';
import PSearch from '@/controls/search/search/PSearch.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuStyle, useProxyValue } from '@/hooks';
import { useQuerySearch } from '@/hooks/use-query-search/use-query-search';

export default defineComponent({
    name: 'PFilterableQueryDropdown',
    components: {
        PContextMenu,
        PSearch,
        PTag,
        PI,
    },
    directives: {
        focus: vFocus,
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        placeholder: {
            type: String,
            default: undefined,
        },
        focused: {
            type: Boolean,
            default: false,
        },
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        useFixedMenuStyle: {
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
        selected: {
            type: Array,
            default: () => [],
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxySelected: useProxyValue('selected', props, emit),
            proxyVisibleMenu: useProxyValue<boolean | undefined>('visibleMenu', props, emit),
            targetRef: null as HTMLElement | null,
            menuRef: null as any,
        });

        const {
            contextMenuStyle,
        } = useContextMenuStyle({
            targetRef: toRef(state, 'targetRef'),
            menuRef: toRef(state, 'menuRef'),
            useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
            visibleMenu: toRef(state, 'proxyVisibleMenu'),
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
                visibleMenu: toRef(state, 'proxyVisibleMenu'),
            },
            { strict: true },
        );


        /* util */
        const selectItem = (queryItem: QueryItem) => {
            if (props.multiSelectable) {
                state.proxySelected = [...state.proxySelected, queryItem];
            } else {
                state.proxySelected = [queryItem];
            }
        };

        /* event */
        const onDeleteTag = (item: SelectDropdownMenuItem, index: number) => {
            state.proxySelected.splice(index, 1);
            state.proxySelected = [...state.proxySelected];
        };

        const onMenuSelect = async (item: KeyMenuItem | ValueMenuItem) => {
            const queryItem = await preTreatSelectedMenuItem(item);
            if (queryItem) selectItem(queryItem);
        };

        const onEnter = async () => {
            const queryItem = await onKeyupEnter();
            if (queryItem) selectItem(queryItem);
        };

        const handleClickDropdownButton = () => {
            if (state.proxyVisibleMenu) hideMenu();
            else showMenu(true);
        };

        return {
            querySearchState,
            ...toRefs(state),
            contextMenuStyle,
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
            onDeleteTag,
            handleClickDropdownButton,
        };
    },
});
</script>

<style lang="postcss">
.p-filterable-query-dropdown {
    @apply w-full relative;
    .p-search {
        .input-container {
            @apply text-sm font-normal;
            padding: 0.25rem 0.5rem;
        }
    }
    .input-set {
        display: inline-flex;
        align-items: center;
        flex-grow: 1;
        width: auto;
        min-width: 7rem;
        height: 1.125rem;
        .input-element {
            flex-grow: 1;
        }
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
        @apply px-2 text-sm font-bold;
        height: 1.125rem;
        line-height: 1.125rem;
        width: max-content;
    }
    .right {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        .delete-button {
            @apply cursor-pointer inline-block flex-shrink-0 rounded-full;
            position: relative;
            height: 1rem;
            width: 1rem;
        }
        .dropdown-button {
            @apply cursor-pointer inline-block flex-shrink-0 rounded-full;
            position: relative;
            height: 1.5rem;
            width: 1.5rem;
        }
        .icon {
            position: absolute;
        }
    }
}
</style>
