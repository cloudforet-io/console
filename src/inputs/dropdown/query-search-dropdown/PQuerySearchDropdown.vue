<template>
    <div v-click-outside="hideMenu" class="p-query-search-dropdown">
        <p-search ref="targetRef"
                  :class="{'no-menu': querySearchState.menu ? querySearchState.menu.length === 0 : false}"
                  :value="querySearchState.searchText"
                  :placeholder="placeholder ? placeholder : 'Select Key: value'"
                  disable-icon
                  :is-focused.sync="querySearchState.isFocused"
        >
            <template #default="scope">
                <p-tag v-for="(selectedItem, index) in proxySelected" :key="`tag-box-${index}`"
                       :key-item="selectedItem.key"
                       :value-item="selectedItem.value"
                       @delete="onDeleteTag(selectedItem, index)"
                />
                <span class="input-set">
                    <span v-for="(keyItem, idx) in querySearchState.selectedKeys" :key="idx" class="key-tag">
                        {{ keyItem.label }}:
                    </span>
                    <input ref="inputRef" v-focus.lazy="querySearchState.isFocused" class="input-element"
                           :value="querySearchState.searchText"
                           :placeholder="querySearchState.currentPlaceholder || scope.placeholder"
                           :type="querySearchState.inputElType"
                           :step="querySearchState.currentDataType === 'integer' ? 1 : undefined"
                           :min="querySearchState.currentDataType === 'integer' ? 0 : undefined"
                           size="1"
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
                    <span v-if="querySearchState.selectedKey || scope.value" class="delete-button" @click="onDeleteAll">
                        <p-i class="icon" name="ic_delete" height="1rem"
                             width="1rem"
                        />
                    </span>
                    <span class="dropdown-button" :class="{'text-blue-600': querySearchState.isFocused}" @click="handleClickDropdownButton">
                        <p-i class="icon" :name="visibleMenuRef ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                             color="inherit"
                        />
                    </span>
                </div>
            </template>
        </p-search>
        <div v-show="visibleMenuRef" class="menu-container">
            <p-context-menu ref="menuRef"
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
    </div>
</template>

<script lang="ts">
import type {
    PropType, DirectiveFunction, SetupContext, Ref,
} from 'vue';
import {
    computed, ref,
    defineComponent, reactive, toRefs,
} from 'vue';

import { vOnClickOutside } from '@vueuse/components';
import { focus as vFocus } from 'vue-focus';

import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle, useProxyValue } from '@/hooks';
import { useQuerySearch } from '@/hooks/query-search';
import { PTag } from '@/index';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { QuerySearchDropdownProps } from '@/inputs/dropdown/query-search-dropdown/type';
import type { SearchDropdownMenuItem } from '@/inputs/dropdown/search-dropdown/type';
import type { KeyMenuItem, ValueMenuItem, QueryItem } from '@/inputs/search/query-search/type';
import PSearch from '@/inputs/search/search/PSearch.vue';

export default defineComponent<QuerySearchDropdownProps>({
    name: 'PQuerySearchDropdown',
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
        visibleMenu: {
            type: Boolean,
            default: false,
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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxySelected: useProxyValue('selected', props, emit),
        });
        const visibleMenuRef: Ref<boolean> = ref<boolean>(props.visibleMenu || false);

        const {
            targetRef, targetElement, contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
            visibleMenu: visibleMenuRef,
        });
        const contextMenuFixedStyleState = reactive({
            visibleMenuRef, targetRef, targetElement, contextMenuStyle,
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
        } = useQuerySearch(props, { strict: true });


        /* util */
        const selectItem = (queryItem: QueryItem) => {
            if (props.multiSelectable) {
                state.proxySelected = [...state.proxySelected, queryItem];
            } else {
                state.proxySelected = [queryItem];
            }
        };

        /* event */
        const onDeleteTag = (item: SearchDropdownMenuItem, index: number) => {
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
            if (querySearchState.visibleMenu) hideMenu();
            else showMenu(true);
        };

        return {
            querySearchState,
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
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
.p-query-search-dropdown {
    @apply w-full;
    .p-search {
        @apply text-sm font-normal;
        padding: 0.25rem 0.5rem;
    }
    .menu-container {
        @apply w-full relative;
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
