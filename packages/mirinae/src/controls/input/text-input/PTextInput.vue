<template>
    <div v-on-click-outside="() => hideMenu(false)"
         class="p-text-input"
         :class="{block, focused: isInputFocused, [size]: true, 'hide-spin-button': hideSpinButton}"
    >
        <div ref="targetRef"
             class="input-container"
             :class="{invalid: isSelectedInvalid || invalid, disabled, readonly}"
             @keyup.down="focusOnContextMenu(0)"
             @keyup.esc.capture.stop="hideMenu"
             @click.stop="handleClickInput"
        >
            <div class="tag-container">
                <template v-if="proxySelected.length > 0 && multiInput">
                    <template v-if="appearanceType === 'stack'">
                        <p-tag v-for="(tag, index) in proxySelected"
                               :key="index"
                               :deletable="!disabled && !readonly"
                               :selected="index === deleteTargetIdx"
                               :invalid="isSelectedItemInvalid(tag, Number(index))"
                               class="tag"
                               @delete="handleDeleteTag(tag, Number(index))"
                        >
                            {{ tag.label || tag.name }}
                        </p-tag>
                    </template>
                    <span v-else-if="appearanceType === 'badge' && (readonly || !isInputFocused)"
                          class="selected-text"
                    >
                        {{ proxySelected[0].label || proxySelected[0].name }}
                        <p-badge v-if="proxySelected.length > 1"
                                 badge-type="subtle"
                                 :style-type="readonly || disabled ? 'gray200' : 'blue200'"
                        >
                            +{{ proxySelected.length - 1 }}
                        </p-badge>
                    </span>
                </template>
                <slot name="default"
                      v-bind="{ value }"
                >
                    <input v-bind="$attrs"
                           ref="inputRef"
                           :class="{block}"
                           :tabindex="(disabled || readonly) ? -1 : 0"
                           :type="inputType"
                           :value="displayedInputValue"
                           :disabled="disabled"
                           :readonly="readonly"
                           :placeholder="stringPlaceholder"
                           :autocomplete="!$attrs.autocomplete ? 'off' : $attrs.autocomplete"
                           :size="1"
                           v-on="$listeners"
                           @input="handleInput"
                           @focus="handleInputFocus"
                           @keyup="handleInputKeyup"
                           @keydown="handleInputKeydown"
                    >
                </slot>
            </div>
            <!-- right-extra slot will be deprecated. use input-right slot. -->
            <span v-if="$slots['right-extra']"
                  class="right-extra"
            >
                <slot name="right-extra"
                      v-bind="{ value }"
                />
            </span>
            <span v-if="$slots['input-right']"
                  class="input-right"
            >
                <slot name="input-right"
                      v-bind="{ value }"
                />
            </span>
            <p-button v-if="($attrs.type === 'password') && maskingMode"
                      size="sm"
                      style-type="transparent"
                      :disabled="disabled"
                      :tabindex="skipMaskToggleTabIndex ? -1 : undefined"
                      :aria-hidden="skipMaskToggleTabIndex ? true : undefined"
                      @click.stop.prevent="handleTogglePassword"
            >
                {{ !proxyShowPassword ? $t('COMPONENT.TEXT_INPUT.HIDE') : $t('COMPONENT.TEXT_INPUT.SHOW') }}
            </p-button>
            <p-i v-else
                 v-show="!readonly && (isInputFocused || isSelectedInvalid)"
                 class="delete-all-icon"
                 name="ic_close"
                 height="1rem"
                 width="1rem"
                 color="inherit transparent"
                 @mousedown.native.prevent
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
                        v-show="readonly ? proxyVisibleMenu && proxySelected.length > 0 : proxyVisibleMenu && refinedMenu.length > 0"
                        ref="menuRef"
                        :menu="readonly ? proxySelected : refinedMenu"
                        :highlight-term="typeof proxyInputValue === 'string' ? proxyInputValue : undefined"
                        :loading="loading || contextMenuLoading"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        :selected="readonly ? [] : proxySelected"
                        :readonly="readonly"
                        :multi-selectable="multiInput"
                        @update:selected="handleUpdateSelected"
                        @focus="handleFocusMenuItem"
                        @keyup:up:end="focusOnInput()"
                        @keyup:down:end="focusOnContextMenu()"
                        @click-show-more="handleClickShowMore"
        />
    </div>
</template>

<script lang="ts">
import type { DirectiveFunction, PropType } from 'vue';
import {
    computed, defineComponent, ref, toRef, watch,
} from 'vue';

import { vOnClickOutside } from '@vueuse/components';
import { useFocus } from '@vueuse/core';
import { unionBy } from 'lodash';
import type { TranslateResult } from 'vue-i18n';

import PButton from '@/controls/buttons/button/PButton.vue';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/controls/context-menu/type';
import { useInputDeletion } from '@/controls/input/composables/use-input-deletion';
import { useSelectedValidation } from '@/controls/input/composables/use-selected-validation';
import { INPUT_APPEARANCE_TYPES, INPUT_SIZE } from '@/controls/input/text-input/type';
import type {
    InputItem, TextInputHandler, InputSize, InputAppearanceType,
} from '@/controls/input/text-input/type';
import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuController } from '@/hooks/use-context-menu-controller/use-context-menu-controller';
import type { ISimpleContextMenu } from '@/hooks/use-context-menu-style/use-context-menu-style';
import { useIgnoreWindowArrowKeydownEvents } from '@/hooks/use-ignore-window-arrow-keydown-events/use-ignore-window-arrow-keydown-events';
import { useProxyValue } from '@/hooks/use-proxy-state/use-proxy-state';


export default defineComponent({
    name: 'PTextInput',
    components: {
        PBadge,
        PTag,
        PI,
        PContextMenu,
        PButton,
    },
    directives: {
        onClickOutside: vOnClickOutside as DirectiveFunction,
    },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: [String, Number],
            default: undefined,
        },
        size: {
            type: String as PropType<InputSize>,
            default: INPUT_SIZE.md,
        },
        isFocused: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String as PropType<TranslateResult>,
            default: '',
        },
        multiInput: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Array as PropType<InputItem[]>,
            default: () => [],
        },
        hideSpinButton: {
            type: Boolean,
            default: false,
        },
        /* context menu fixed style props */
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        useFixedMenuStyle: {
            type: Boolean,
            default: false,
        },
        /* context menu props */
        menu: {
            type: Array as PropType<MenuItem[]>,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        /* extra props */
        handler: {
            type: Function as PropType<TextInputHandler>,
            default: undefined,
        },
        disableHandler: {
            type: Boolean,
            default: false,
        },
        useAutoComplete: {
            type: Boolean,
            default: false,
        },
        showPassword: {
            type: Boolean,
            default: true,
        },
        appearanceType: {
            type: String as PropType<InputAppearanceType>,
            default: INPUT_APPEARANCE_TYPES[0],
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        skipMaskToggleTabIndex: {
            type: Boolean,
            default: false,
        },
    },

    setup(props, { emit, attrs }) {
        /* input focusing */
        const inputRef = ref<HTMLElement|null>(null);
        const { focused: isInputFocused } = useFocus(inputRef, { initialValue: props.isFocused });
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

        /* placeholder */
        const stringPlaceholder = computed(() => String(props.placeholder));

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
        const displayedInputValue = computed<string|number|undefined>(() => {
            if (props.multiInput) return proxyInputValue.value;
            if (props.useAutoComplete) {
                const item = proxySelected.value[0];
                if (item) return item.label as string ?? item.name;
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
        const toggleMenu = (focusInput?: boolean) => {
            if (props.useAutoComplete) {
                if (proxyVisibleMenu.value) hideMenu(focusInput);
                else showMenu(focusInput);
            }
        };

        /* context menu controller */
        const unionSelected = computed<InputItem[]>(() => unionBy<InputItem>(proxySelected.value, 'name'));
        const menuRef = ref<null|ISimpleContextMenu>(null);
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
        const handleClickShowMore = async () => {
            await showMoreMenu();
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
        const inputType = computed<string>(() => {
            if (maskingMode.value) {
                if (attrs.type === 'password') return proxyShowPassword.value ? 'password' : 'text';
                return attrs.type as string;
            }
            return attrs.type as string;
        });

        /* input event listeners */
        const handleClickInput = () => {
            if (props.disabled) return;
            if (props.readonly) {
                if (props.appearanceType !== 'badge') return;
                if (proxySelected.value.length <= 1) return;
            }
            showMenu(true);
        };
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


        watch(() => proxySelected.value, (selected) => {
            emit('update', selected, !isSelectedInvalid.value);
        });
        watch(() => props.menu, () => {
            initiateMenu();
        });


        /* ignore window arrow keydown event */
        useIgnoreWindowArrowKeydownEvents({ predicate: computed(() => !!proxyVisibleMenu.value) });

        return {
            proxySelected,
            /* selected validation */
            isSelectedInvalid,
            isSelectedItemInvalid,
            /* input value */
            proxyInputValue,
            displayedInputValue,
            isInputValueEmpty,
            /* input focusing */
            inputRef,
            isInputFocused,
            focusOnInput,
            /* placeholder */
            stringPlaceholder,
            /* context menu controller */
            menuRef,
            targetRef,
            contextMenuStyle,
            contextMenuLoading,
            refinedMenu,
            showMoreMenu,
            focusOnContextMenu,
            /* menu visibility */
            proxyVisibleMenu,
            showMenu,
            hideMenu,
            toggleMenu,
            /* selected deletion */
            deleteTargetIdx,
            handleDeleteTag,
            handleDeleteAllTags,
            /* context menu event listeners */
            handleFocusMenuItem,
            handleUpdateSelected,
            handleClickShowMore,
            /* input password & masking */
            proxyShowPassword,
            handleTogglePassword,
            maskingMode,
            /* input type */
            inputType,
            /* input event listeners */
            handleClickInput,
            handleInput,
            handleInputFocus,
            handleInputKeyup,
            handleInputKeydown,
        };
    },
});
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
        @apply inline-flex border border-gray-300 bg-white text-gray-900 rounded items-center;
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
        &.focused, &:focus-within:not(.disabled):not(.readonly):not(.invalid) {
            @apply border-secondary bg-blue-100;
        }
        &:hover:not(.disabled):not(.readonly):not(.invalid) {
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
            @apply truncate w-full;
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
    &.hide-spin-button {
        input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
        }

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
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
        .input-container > .tag-container {
            padding-top: 0.219rem;
            padding-bottom: 0.219rem;
        }
    }
    &.md {
        @mixin size 2rem, 0.875rem, 2rem;
    }
}
</style>
