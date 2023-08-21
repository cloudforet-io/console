<template>
    <div ref="containerRef"
         class="p-text-input"
         :class="{block, focused: isInputFocused, [size]: true}"
    >
        <div ref="targetRef"
             class="input-container"
             :class="{invalid: isSelectedInvalid || invalid, disabled}"
             @keyup.down="focusOnContextMenu(0)"
             @keyup.esc.capture.stop="handleTypeEsc"
             @click.stop="showMenu(true)"
        >
            <div class="tag-container">
                <template v-if="proxySelected.length > 0 && multiInput">
                    <template v-if="appearanceType === 'stack'">
                        <p-tag v-for="(tag, index) in proxySelected"
                               :key="index"
                               :deletable="!disabled"
                               :selected="index === deleteTargetIdx"
                               :invalid="isSelectedItemInvalid(tag, index)"
                               class="tag"
                               @delete="handleDeleteTag(tag, index)"
                        >
                            {{ tag.label || tag.name }}
                        </p-tag>
                    </template>
                    <span v-else-if="appearanceType === 'badge' && !isInputFocused"
                          class="selected-text"
                    >
                        {{ proxySelected[0].label || proxySelected[0].name }}
                        <p-badge v-if="proxySelected.length > 1"
                                 :style-type="disabled ? 'gray200' : 'blue200'"
                        >
                            +{{ proxySelected.length - 1 }}
                        </p-badge>
                    </span>
                </template>
                <slot name="default"
                      v-bind="{ value }"
                >
                    <input v-bind="attrs"
                           ref="inputRef"
                           :tabindex="disabled || attrs.readonly ? -1 : 0"
                           :type="inputType"
                           :value="displayedInputValue"
                           :disabled="disabled"
                           :placeholder="placeholder"
                           :autocomplete="attrs.autocomplete && typeof attrs.autocomplete === 'string' ? attrs.autocomplete : 'off'"
                           size="1"
                           v-on="listeners"
                           @input="handleInput"
                           @focus="handleInputFocus"
                           @keyup="handleInputKeyup"
                           @keydown="handleInputKeydown"
                    >
                </slot>
            </div>
            <!-- right-extra slot will be deprecated. use input-right slot. -->
            <span v-if="slots['right-extra']"
                  class="right-extra"
            >
                <slot name="right-extra"
                      v-bind="{ value }"
                />
            </span>
            <span v-if="slots['input-right']"
                  class="input-right"
            >
                <slot name="input-right"
                      v-bind="{ value }"
                />
            </span>
            <p-button v-if="(attrs.type === 'password') && maskingMode"
                      size="sm"
                      style-type="transparent"
                      :disabled="disabled"
                      @click.stop.prevent="handleTogglePassword"
            >
                {{ !proxyShowPassword ? t('COMPONENT.TEXT_INPUT.HIDE') : t('COMPONENT.TEXT_INPUT.SHOW') }}
            </p-button>
            <p-i v-else
                 v-show="(isInputFocused || isSelectedInvalid)"
                 class="delete-all-icon"
                 name="ic_close"
                 height="1rem"
                 width="1rem"
                 color="inherit transparent"
                 @mousedown.prevent
                 @click.stop="handleDeleteAllTags"
            />
            <span v-if="$slots['right-edge']"
                  class="right-edge"
            >
                <slot name="right-edge"
                      v-bind="{ value }"
                />
            </span>
        </div>
        <p-context-menu v-if="useAutoComplete"
                        v-show="proxyVisibleMenu && refinedMenu.length > 0"
                        ref="menuRef"
                        :menu="refinedMenu"
                        :highlight-term="typeof proxyInputValue === 'string' ? proxyInputValue : undefined"
                        :loading="loading || contextMenuLoading"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        :selected="proxySelected"
                        :multi-selectable="multiInput"
                        @update:selected="handleUpdateSelected"
                        @focus="handleFocusMenuItem"
                        @keyup:up:end="focusOnInput()"
                        @keyup:down:end="focusOnContextMenu()"
                        @click-show-more="showMoreMenu"
        />
    </div>
</template>

<script setup lang="ts">

import { useFocus, onClickOutside } from '@vueuse/core';
import { unionBy } from 'lodash';
import {
    computed, ref, toRef, useAttrs, useSlots, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useI18n } from 'vue-i18n';

import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useIgnoreWindowArrowKeydownEvents } from '@/hooks';
import { useContextMenuController } from '@/hooks/context-menu-controller';
import { useProxyValue } from '@/hooks/proxy-state';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import { useInputDeletion } from '@/inputs/input/composables/use-input-deletion';
import { useSelectedValidation } from '@/inputs/input/composables/use-selected-validation';
import { INPUT_APPEARANCE_TYPES, INPUT_SIZE } from '@/inputs/input/text-input/type';
import type {
    InputItem, TextInputHandler, InputSize, InputAppearanceType,
} from '@/inputs/input/text-input/type';

interface Props {
    value?: string | number;
    size: InputSize;
    isFocused: boolean;
    disabled: boolean;
    block: boolean;
    invalid: boolean;
    placeholder: string;
    multiInput: boolean;
    selected: InputItem[];
    visibleMenu: boolean;
    useFixedMenuStyle: boolean;
    menu: MenuItem[];
    loading: boolean;
    handler: TextInputHandler;
    disableHandler: boolean;
    useAutoComplete: boolean;
    showPassword: boolean;
    appearanceType: InputAppearanceType;
    pageSize: number;
    type?: string;
}

const props = withDefaults(defineProps<Props>(), {
    value: undefined,
    size: INPUT_SIZE.md,
    isFocused: false,
    disabled: false,
    block: false,
    invalid: false,
    placeholder: '',
    multiInput: false,
    selected: () => [],
    visibleMenu: undefined,
    useFixedMenuStyle: false,
    menu: () => [],
    loading: false,
    handler: undefined,
    disableHandler: false,
    useAutoComplete: false,
    showPassword: true,
    appearanceType: INPUT_APPEARANCE_TYPES[0],
    pageSize: undefined,
    type: 'text',
});

const emit = defineEmits<{(e: 'update:value', value?: string | number): void;
    (e: 'update:is-focused', value: boolean): void;
    (e: 'update:visible-menu', value: boolean): void;
    (e: 'update:selected', value: InputItem[]): void;
    (e: 'hide-menu'): void;
    (e: 'show-menu'): void;
    (e: 'delete-tag', value: InputItem, idx: number): void;
    (e: 'delete-all-tags'): void;
    (e: 'focus-menu', idx: string): void;
    (e: 'update:show-password', value: boolean): void;
    (e: 'update', selected: InputItem[], valid: boolean): void;
}>();
const attrs = useAttrs();
const slots = useSlots();
const { t } = useI18n();

/* input focusing */
const inputRef = ref<HTMLElement|null>(null);
const { focused: isInputFocused } = useFocus(inputRef, { initialValue: props.isFocused });

/* on click outside */
const containerRef = ref<HTMLElement|null>(null);

const focusOnInput = () => {
    if (isInputFocused.value) return;
    isInputFocused.value = true;
};
watch(isInputFocused, (val) => {
    emit('update:is-focused', val);
});
watch(() => props.isFocused, (val) => {
    if (val === isInputFocused.value) return;
    isInputFocused.value = !!val;
});

/* selected */
const proxySelected = ref<InputItem[]>(props.selected);
const updateSelected = (selected: InputItem[]) => {
    proxySelected.value = selected;
    emit('update:selected', selected);
};
watch(() => props.selected, (selected) => {
    if (selected === proxySelected.value) return;
    updateSelected(selected);
});

/* selected validation */
const { isSelectedInvalid, isSelectedItemInvalid } = useSelectedValidation({ selected: proxySelected });

/* input value */
const proxyInputValue = ref<string|number|undefined>(props.value);
const updateInputValue = (value?: string|number) => {
    proxyInputValue.value = value;
    emit('update:value', value);
};
const displayedInputValue = computed<TranslateResult|number|undefined>(() => {
    if (props.multiInput) return proxyInputValue.value;
    if (props.useAutoComplete) {
        const item = proxySelected.value[0];
        if (item) return item.label ?? item.name;
    }
    return proxyInputValue.value;
});
const isInputValueEmpty = computed(() => {
    if (typeof proxyInputValue.value === 'string') return !proxyInputValue.value.length;
    return proxyInputValue.value === undefined;
});
watch(() => props.value, (value) => {
    if (value === proxyInputValue.value) return;
    updateInputValue(value);
});

/* query input mode */
const proxyVisibleMenu = useProxyValue<boolean>('visibleMenu', props, emit);

/* menu visibility */
const hideMenu = (focusInput?: boolean) => {
    if (proxyVisibleMenu.value) {
        proxyVisibleMenu.value = false;
        emit('hide-menu');
    }
    if (focusInput) focusOnInput();
};
const showMenu = (focusInput?: boolean) => {
    if (props.useAutoComplete && !proxyVisibleMenu.value) {
        proxyVisibleMenu.value = true;
        emit('show-menu');
    }
    if (focusInput) focusOnInput();
};

/* context menu controller */
const unionSelected = computed<InputItem[]>(() => unionBy<InputItem>(proxySelected.value, 'name'));
const menuRef = ref<null|typeof PContextMenu>(null);
const targetRef = ref<null|HTMLElement>(null);
const {
    contextMenuStyle, loading: contextMenuLoading, refinedMenu,
    focusOnContextMenu, initiateMenu, reloadMenu, showMoreMenu,
} = useContextMenuController({
    useFixedStyle: toRef(props, 'useFixedMenuStyle'),
    targetRef,
    contextMenuRef: menuRef,
    visibleMenu: proxyVisibleMenu,
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: computed(() => {
        if (proxyInputValue.value === undefined) return '';
        return typeof proxyInputValue.value === 'string' ? proxyInputValue.value : `${proxyInputValue.value}`;
    }),
    selected: unionSelected,
    handler: toRef(props, 'handler'),
    menu: toRef(props, 'menu'),
    pageSize: toRef(props, 'pageSize'),
});

/* selected deletion */
const {
    deleteTargetIdx, deleteSingleSelectedValue, deleteTargetTag, deleteTag, deleteAll,
} = useInputDeletion({
    selected: proxySelected,
    updateValueAfterDeletion: (item) => {
        if (item) {
            const value = ['string', 'number'].includes(typeof item.label) ? item.label as string : item.name;
            updateInputValue(value);
        } else {
            updateInputValue('');
        }
    },
    updateSelected,
    isInputValueEmpty,
});
const handleDeleteTag = (tag: InputItem, idx: number) => {
    deleteTag(tag, idx);
    emit('delete-tag', tag, idx);
};
const handleDeleteAllTags = () => {
    deleteAll();
    reloadMenu();
    showMenu();
    emit('delete-all-tags');
};

const handleTypeEsc = () => {
    if (proxyVisibleMenu.value) {
        proxyVisibleMenu.value = false;
        emit('hide-menu');
    }
};

/* context menu event listeners */
const handleFocusMenuItem = (idx: string) => {
    emit('focus-menu', idx);
};
const handleUpdateSelected = (items: InputItem[]) => {
    updateSelected(items);
    if (props.multiInput) {
        updateInputValue('');
    } else {
        hideMenu(false);
    }
};

/* input password & masking */
const proxyShowPassword = useProxyValue('showPassword', props, emit);
const handleTogglePassword = () => {
    proxyShowPassword.value = !proxyShowPassword.value;
};
const maskingMode = computed(() => props.appearanceType === 'masking');
watch(maskingMode, (masking) => {
    if (masking) proxyShowPassword.value = true;
});

/* input type */
const inputType = computed(() => {
    if (maskingMode.value) {
        if (props.type === 'password') return proxyShowPassword.value ? 'password' : 'text';
        return props.type;
    }
    return props.type;
});

/* input event listeners */
const handleInput = (event) => {
    updateInputValue(event.target.value);
    if (props.useAutoComplete) {
        showMenu();
        reloadMenu();
    }
};
const handleInputFocus = () => {
    if (props.useAutoComplete) {
        initiateMenu();
    }
};
const handleInputKeyup = (event) => {
    if ((event.key === 'ArrowDown' || event.key === 'Down') && props.useAutoComplete) {
        if (refinedMenu.value.length === 0) return;
        if (menuRef.value) focusOnContextMenu(0);
    }
    if (event.key === 'Enter') {
        if (event.target.value?.length > 0) {
            if (props.multiInput) {
                updateSelected([...proxySelected.value, { label: event.target.value, name: event.target.value }]);
                updateInputValue('');
            } else {
                updateSelected([{ label: event.target.value, name: event.target.value }]);
            }
        }
    }
};
const handleInputKeydown = (event) => {
    if (event.key === 'Backspace') {
        if (proxySelected.value.length) {
            if (props.multiInput) deleteTargetTag();
            else deleteSingleSelectedValue();
        } else if (isInputValueEmpty.value) {
            hideMenu(true);
        }
    }
};

const listeners = {
    ...attrs,
};


watch(() => proxySelected.value, (selected) => {
    emit('update', selected, !isSelectedInvalid.value);
});
watch(() => props.menu, () => {
    initiateMenu();
});


/* ignore window arrow keydown event */
useIgnoreWindowArrowKeydownEvents({ predicate: computed(() => !!proxyVisibleMenu.value) });

onClickOutside(containerRef, () => hideMenu(false));


</script>

<style lang="postcss">
.p-text-input {
    @apply relative;
    width: 15rem;
    display: inline-block;
    &.block {
        @apply w-full;
    }
    > .input-container {
        @apply inline-flex border bg-white text-gray-900 rounded items-center;
        width: inherit;
        min-height: 2rem;
        height: auto;
        font-size: 0.875rem;
        line-height: 2rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;

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
            padding: 0.375rem 0;
            gap: 0.5rem;
            > .tag {
                height: 1.25rem;
                min-width: 2.5rem;
                margin: 0;
            }
            > .selected-text {
                line-height: 1.25;
            }
        }

        input {
            @apply truncate;
            display: inline-block;
            flex-grow: 1;
            border-width: 0;
            height: 100%;
            appearance: none;
            line-height: inherit;
            font-size: inherit;
            color: inherit;
            background-color: transparent;
            &::placeholder {
                @apply text-gray-300;
            }
            &:read-only {
                pointer-events: none;
            }
            &:disabled {
                @apply bg-transparent border-0;
            }
        }

        > .right-extra, > .input-right {
            @apply text-gray-400;
            display: inline-flex;
            flex-shrink: 0;
            height: 100%;
            overflow: hidden;
            line-height: inherit;
            font-size: inherit;
        }

        > .right-edge {
            display: inline-flex;
            flex-shrink: 0;
            height: 100%;
            overflow: hidden;
            line-height: inherit;
            font-size: inherit;
        }

        .delete-all-icon {
            @apply text-gray-400 cursor-pointer;
            flex-shrink: 0;
        }
    }
    .p-context-menu {
        z-index: 1000;
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
