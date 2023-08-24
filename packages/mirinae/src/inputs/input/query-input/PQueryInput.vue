<template>
    <div ref="containerRef"
         class="p-query-input"
         :class="{'container-block': props.block, [props.size]: true}"
    >
        <div ref="targetRef"
             class="input-container"
             :tabindex="disabled ? -1 : 0"
             :class="{invalid: props.invalid || isSelectedInvalid, disabled: props.disabled}"
        >
            <span class="tag-container">
                <template v-if="proxySelected.length > 0">
                    <template v-if="appearanceType === 'stack'">
                        <p-tag v-for="(selectedItem, index) in proxySelected"
                               :key="`tag-box-${index}`"
                               :key-item="selectedItem.key"
                               :value-item="selectedItem.value"
                               :selected="deleteTargetIdx === index"
                               :invalid="selectedItem.error || isSelectedItemInvalid(selectedItem, index)"
                               @delete="handleTagDelete(selectedItem, index)"
                        />
                    </template>
                    <span v-else-if="appearanceType === 'badge'"
                          class="selected-text"
                    >
                        {{ selectedDisplayValue }}
                        <p-badge v-if="proxySelected.length > 1">
                            +{{ proxySelected.length - 1 }}
                        </p-badge>
                    </span>
                    <span v-else>
                        {{ selectedDisplayValue }}
                    </span>
                </template>
                <span class="query-input-set">
                    <span v-for="(keyItem, idx) in selectedKeys"
                          :key="idx"
                          class="key-tag"
                    >
                        {{ keyItem.label }}<template v-if="selectedKeys.length > idx + 1">.</template>
                    </span>
                    <span v-if="selectedKeys.length && menuType === 'VALUE'"
                          class="key-tag"
                    >:</span>
                    <input ref="inputRef"
                           :value="searchText"
                           :placeholder="currentPlaceholder || placeholder || 'Enter property: value'"
                           :type="inputElType"
                           :step="currentDataType === 'integer' ? 1 : undefined"
                           :min="currentDataType === 'integer' ? 0 : undefined"
                           size="1"
                           :disabled="disabled"
                           @input="onInput"
                           @keyup.enter="handleInputKeyupEnter"
                           @keydown="onKeydownCheck"
                           @keydown.delete="handleInputKeydownDelete"
                           @click.stop="showMenu(true)"
                           @focus="focus"
                           @blur="blur"
                           @paste="onPaste"
                    >
                </span>
            </span>
            <div class="right-toolbox">
                <span v-if="proxySelected.length || selectedKey || searchText"
                      class="delete-button"
                      @click="handleDeleteAll"
                >
                    <p-i class="icon"
                         name="ic_close"
                         height="1rem"
                         width="1rem"
                    />
                </span>
            </div>
        </div>
        <p-context-menu v-show="proxyVisibleMenu && menu.length > 0"
                        ref="menuRef"
                        :class="{'no-menu': menu ? menu.length === 0 : false}"
                        :loading="lazyLoading"
                        :menu="menu"
                        :highlight-term="searchText"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        no-select-indication
                        @keyup:up:end="focus"
                        @keyup:down:end="focus"
                        @select="handleMenuSelect"
                        @blur="focus"
        />
    </div>
</template>

<script setup lang="ts">

import { useFocus, onClickOutside } from '@vueuse/core';
import { isEqual } from 'lodash';
import {
    computed,
    ref, toRef, toRefs, watch,
} from 'vue';

import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle, useProxyValue } from '@/hooks';
import { useQuerySearch } from '@/hooks/query-search';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type { FilterableDropdownAppearanceType } from '@/inputs/dropdown/filterable-dropdown/type';
import { useInputDeletion } from '@/inputs/input/composables/use-input-deletion';
import { useSelectedValidation } from '@/inputs/input/composables/use-selected-validation';
import type { InputSize } from '@/inputs/input/text-input/type';
import { INPUT_APPEARANCE_TYPES, INPUT_SIZE } from '@/inputs/input/text-input/type';
import type {
    KeyMenuItem, ValueMenuItem, QueryItem, KeyItemSet, ValueHandlerMap,
} from '@/inputs/search/query-search/type';



interface QueryInputProps {
    value?: string|number;
    size?: InputSize;
    disabled?: boolean;
    block?: boolean;
    invalid?: boolean;
    placeholder?: string;
    multiInput?: boolean;
    selected?: QueryItem[];
    keyItemSets?: KeyItemSet[];
    valueHandlerMap?: ValueHandlerMap;
    visibleMenu?: boolean;
    useFixedMenuStyle?: boolean;
    appearanceType?: FilterableDropdownAppearanceType;
}
const props = withDefaults(defineProps<QueryInputProps>(), {
    value: '',
    size: INPUT_SIZE.md,
    disabled: false,
    placeholder: '',
    multiInput: false,
    selected: () => [],
    keyItemSets: () => [],
    valueHandlerMap: () => ({}),
    visibleMenu: false,
    useFixedMenuStyle: false,
    appearanceType: INPUT_APPEARANCE_TYPES[0],
});
const emit = defineEmits<{(e: 'update:visible-menu', visibleMenu: boolean): void;
    (e: 'update:selected', selected: QueryItem[]): void;
    (e: 'update', selected: QueryItem[], isValid: boolean): void;
}>();

/* input focusing */
const inputRef = ref<HTMLElement|null>(null);
const { focused: isInputFocused } = useFocus(inputRef);

/* on click outside */
const containerRef = ref<HTMLElement|null>(null);

/* context menu style */
const proxyVisibleMenu = useProxyValue<boolean>('visibleMenu', props, emit);
const {
    targetRef, contextMenuStyle,
} = useContextMenuFixedStyle({
    useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
    visibleMenu: proxyVisibleMenu,
});

/* query search */
const menuRef = ref<null|typeof PContextMenu>(null);
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
        focused: isInputFocused,
        valueHandlerMap: toRef(props, 'valueHandlerMap'),
        keyItemSets: toRef(props, 'keyItemSets'),
        visibleMenu: proxyVisibleMenu,
        menuRef,
    },
    { strict: false },
);
const {
    selectedKey, selectedKeys, searchText, currentPlaceholder, currentDataType, menuType, menu, inputElType, lazyLoading,
} = toRefs(querySearchState);

/* selection */
const proxySelected = ref<QueryItem[]>(props.selected);
const addToSelected = (queryItem: QueryItem) => {
    if (props.multiInput) {
        proxySelected.value = [...proxySelected.value, queryItem];
    } else {
        proxySelected.value = [queryItem];
    }
};
const handleMenuSelect = async (_item: MenuItem) => {
    const item = _item as KeyMenuItem | ValueMenuItem;
    const queryItem = await preTreatSelectedMenuItem(item);
    if (queryItem) addToSelected(queryItem);
};
const handleInputKeyupEnter = async () => {
    const queryItem = await onKeyupEnter();
    if (queryItem) addToSelected(queryItem);
};

/* selected deletion */
const {
    deleteTargetIdx, deleteSingleSelectedValue, deleteTargetTag, deleteTag,
} = useInputDeletion<QueryItem>({
    selected: proxySelected,
    updateSelected: (val) => { proxySelected.value = val; },
    isInputValueEmpty: computed(() => !searchText.value),
});
const handleInputKeydownDelete = () => {
    if (proxySelected.value.length && !selectedKeys.value.length && !searchText.value) {
        if (props.multiInput) {
            deleteTargetTag();
        } else {
            deleteSingleSelectedValue();
        }
    }
};
const handleTagDelete = (item: QueryItem, index: number) => {
    deleteTag(item, index);
};
const handleDeleteAll = () => {
    onDeleteAll();
    proxySelected.value = [];
};

/* selected validation */
const { isSelectedInvalid, isSelectedItemInvalid } = useSelectedValidation<QueryItem>({
    selected: proxySelected,
    itemKey: (item) => `${item.key?.name ?? ''}:${item.value?.name ?? ''}`,
});
watch(() => proxySelected.value, (selected) => {
    emit('update:selected', selected);
    emit('update', selected, !isSelectedInvalid.value);
});
watch(() => props.selected, (selected) => {
    if (isEqual(selected, proxySelected.value)) return;
    proxySelected.value = selected;
});

/* UI Display */
const getSelectedItemDisplayValue = (item: QueryItem) => {
    const key = item.key;
    const value = item.value;
    if (key) return `${key.label ?? key.name}: ${value.label ?? value.name}`;
    return `${value.label ?? value.name}`;
};
const selectedDisplayValue = computed(() => {
    if (props.appearanceType === 'badge') {
        if (proxySelected.value[0]) {
            return getSelectedItemDisplayValue(proxySelected.value[0]);
        }
        return '';
    }
    if (props.multiInput) {
        return proxySelected.value.map((item) => getSelectedItemDisplayValue(item)).join(', ');
    } if (proxySelected.value[0]) {
        return getSelectedItemDisplayValue(proxySelected.value[0]);
    }
    return '';
});

onClickOutside(containerRef, hideMenu);

</script>

<style lang="postcss">
.p-query-input {
    position: relative;
    width: 15rem;
    &.container-block {
        @apply w-full;
    }
    > .input-container {
        @apply border border-gray-300 bg-white text-sm text-gray-900 font-normal rounded;
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.25rem 0.5rem;
        height: auto;
        min-height: 2rem;
        min-width: 0;
        line-height: 2rem;
        box-sizing: border-box;
        &.invalid {
            @apply border-alert;
        }
        &.disabled {
            @apply border-gray-300 bg-gray-100;
        }
        &.focused, &:focus-within:not(.disabled):not(.invalid) {
            @apply border-secondary bg-blue-100;
        }
        &:hover:not(.disabled):not(.invalid) {
            @apply border-secondary;
        }
        > .tag-container {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            gap: 0.5rem;
            > .p-tag {
                margin: 0;
            }
            > .query-input-set {
                display: inline-flex;
                flex-wrap: wrap;
                align-items: center;
                width: auto;
                min-width: 7rem;
                flex-grow: 1;
                > .key-tag {
                    @apply text-sm font-bold;
                    height: 1.125rem;
                    line-height: 1.125rem;
                    width: max-content;
                    margin: 0;
                }
                > input {
                    @apply border-0 bg-transparent;
                    flex-grow: 1;
                    width: auto;
                    margin-left: 0.25rem;
                    color: inherit;
                    font-size: 0.875rem;
                    appearance: none;
                    min-height: 1.125rem;
                    line-height: 1.125rem;
                    &::placeholder {
                        @apply text-gray-300;
                    }
                    &:placeholder-shown {
                        text-overflow: ellipsis;
                    }
                    &:focus {
                        outline: none;
                    }
                    &:read-only {
                        pointer-events: none;
                    }
                    &:disabled {
                        @apply bg-transparent border-0;
                    }
                }
            }
        }
        > .right-toolbox {
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            .delete-button {
                @apply cursor-pointer inline-block flex-shrink-0 rounded-full;
                position: relative;
                height: 1rem;
                width: 1rem;
            }
            .icon {
                position: absolute;
            }
        }
    }
    > .p-context-menu {
        @apply font-normal;
        max-width: 100%;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: auto;
        width: auto;
        &.no-menu {
            border-width: 0;
        }
    }

    @define-mixin size $input-height, $font-size, $line-height {
        .input-container {
            min-height: $input-height;
            font-size: $font-size;
            line-height: $line-height;
        }
    }
    &.sm {
        @mixin size 1.5rem, 0.75rem, 1.5rem;
    }
    &.md {
        @mixin size 2rem, 0.875rem, 2rem;
    }
}
</style>
