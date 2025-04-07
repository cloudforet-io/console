<script setup lang="ts">
import { toRef } from 'vue';

import {
    useSelectDropdownButtonDisplay,
} from '@/controls/dropdown/select-dropdown/composables/select-dropdown-button-display';
import {
    SELECT_DROPDOWN_APPEARANCE_TYPE,
    SELECT_DROPDOWN_STYLE_TYPE,
} from '@/controls/dropdown/select-dropdown/type';
import type {
    SelectDropdownAppearanceType, SelectDropdownMenuItem, SelectDropdownStyleType,
    SelectDropdownSize,
} from '@/controls/dropdown/select-dropdown/type';
import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';

interface Props {
    styleType?: SelectDropdownStyleType;
    appearanceType?: SelectDropdownAppearanceType;
    size?: SelectDropdownSize;
    buttonIcon?: string;
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    selectionLabel?: string;
    showAlertDot?: boolean;
    showDeleteAllButton?: boolean;
    isFixedWidth?: boolean;
    selectionHighlight?: boolean;
    isVisibleMenu?: boolean;
    readonly?: boolean;
    multiSelectable?: boolean;
    selectedItems?: SelectDropdownMenuItem[];
}
const CHEVRON_ICON_STYLES: SelectDropdownStyleType[] = [SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON, SELECT_DROPDOWN_STYLE_TYPE.TERTIARY_ICON_BUTTON];
const props = withDefaults(defineProps<Props>(), {
    styleType: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
    appearanceType: SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC,
    size: 'md',
    placeholder: undefined,
    selectionLabel: undefined,
    showDeleteAllButton: false,
    buttonIcon: undefined,
    isVisibleMenu: undefined,
    selectedItems: undefined,
});

/* event emits */
const emit = defineEmits<{(e: 'update:selectedItems', selected: SelectDropdownMenuItem[]|string|number): void;
    (e: 'click-delete', item?: SelectDropdownMenuItem, idx?: number): void;
    (e: 'click-dropdown-button'): void;
    (e: 'enter-key'): void;
}>();

/* dropdown button display */
const {
    displayValueOnDropdownButton,
    showTagsOnDropdownButton,
    displayBadgeValueOnDropdownButton,
} = useSelectDropdownButtonDisplay({
    multiSelectable: toRef(props, 'multiSelectable'),
    selected: toRef(props, 'selectedItems'),
    appearanceType: toRef(props, 'appearanceType'),
});

const handleClickDeleteAll = () => {
    if (!props.disabled && props.selectedItems && props.selectedItems.length > 0) {
        emit('click-delete');
    }
};
const handleTagDelete = (item: SelectDropdownMenuItem, idx: number) => {
    emit('click-delete', item, idx);
};
</script>

<template>
    <div :class="{
        'dropdown-button-component': true,
        [props.styleType]: !$scopedSlots['icon-button'],
        [props.appearanceType]: true,
        [props.size]: true,
        invalid: props.invalid,
        disabled: props.disabled,
        readonly: props.readonly,
        opened: props.isVisibleMenu,
        selected: props.selectedItems && props.selectedItems.length > 0,
        'is-fixed-width': props.isFixedWidth,
        'selection-highlight': props.selectionHighlight && props.selectedItems && props.selectedItems.length > 0,
        'has-items': props.readonly && displayBadgeValueOnDropdownButton,
    }"
    >
        <span v-if="$scopedSlots['icon-button']"
              @click.stop="emit('click-dropdown-button')"
              @keydown.down="emit('enter-key')"
        >
            <slot
                name="icon-button"
                v-bind="props.selectedItems"
            />
        </span>
        <span v-else-if="CHEVRON_ICON_STYLES.includes(props.styleType)"
              class="dropdown-icon-button-wrapper"
              @click.stop="emit('click-dropdown-button')"
        >
            <p-i :name="props.buttonIcon || (props.isVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down')"
                 color="inherit"
                 :width="props.size === 'sm' ? '1rem' : '1.5rem'"
                 :height="props.size === 'sm' ? '1rem' : '1.5rem'"
                 class="dropdown-icon-button"
                 :class="[props.styleType]"
                 @keydown.down="emit('enter-key')"
            />
        </span>
        <div v-else
             class="dropdown-button"
             :tabindex="(props.disabled || props.readonly) ? -1 : 0"
             @keyup.down="emit('enter-key')"
             @keyup.esc.capture.stop="emit('click-dropdown-button')"
             @keyup.enter.capture.stop="emit('click-dropdown-button')"
             @click="emit('click-dropdown-button')"
        >
            <div class="selection-display-container">
                <span v-if="props.showAlertDot"
                      class="show-alert-dot"
                />
                <slot name="input-left-area" />
                <slot name="button"
                      v-bind="props.selectedItems"
                >
                    <div class="selection-display-wrapper">
                        <span v-if="displayValueOnDropdownButton === undefined"
                              class="placeholder"
                        >
                            {{ props.selectionLabel
                                ? props.selectionLabel
                                : props.placeholder || $t('COMPONENT.SELECT_DROPDOWN.SELECT') }}
                        </span>
                        <span v-else
                              class="selection-wrapper"
                        >
                            <b v-if="props.selectionLabel">
                                {{ props.selectionLabel }}:
                            </b>
                            <span v-if="displayValueOnDropdownButton"
                                  class="selected-item"
                            >
                                <span class="selected-item-text">{{ displayValueOnDropdownButton }}</span>
                                <p-badge v-if="displayBadgeValueOnDropdownButton"
                                         class="selected-item-badge"
                                         :style-type="props.readonly || props.disabled ? 'gray200' : 'blue200'"
                                         :badge-type="props.readonly || props.disabled ? 'solid' : 'subtle'"
                                >
                                    {{ displayBadgeValueOnDropdownButton }}
                                </p-badge>
                            </span>
                            <div v-else-if="showTagsOnDropdownButton"
                                 class="tags-wrapper"
                            >
                                <p-tag v-for="(item, idx) in props.selectedItems"
                                       :key="item.name"
                                       class="selected-tag"
                                       :deletable="!props.readonly && !props.disabled"
                                       @delete="handleTagDelete(item, idx)"
                                >
                                    {{ item.label || item.name }}
                                </p-tag>
                            </div>
                        </span>
                    </div>
                </slot>
            </div>
            <div class="extra-button-wrapper">
                <span v-if="!props.readonly && !props.disabled && props.showDeleteAllButton && props.selectedItems && props.selectedItems.length > 0"
                      :class="{'delete-all-button': true, 'disabled': props.disabled}"
                      @click.stop="handleClickDeleteAll"
                >
                    <p-i name="ic_close"
                         width="1rem"
                         height="1rem"
                         color="inherit transparent"
                    />
                </span>
                <span class="arrow-button"
                      @click.stop="emit('click-dropdown-button')"
                >
                    <slot name="button-icon">
                        <p-i :name="props.isVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                             :width="props.size === 'sm' ? '1rem' : '1.5rem'"
                             :height="props.size === 'sm' ? '1rem' : '1.5rem'"
                             color="inherit"
                        />
                    </slot>
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dropdown-button-component {
    /* style type - default */
    .dropdown-button {
        @apply flex justify-between items-center bg-white text-label-md font-normal border rounded-default border-gray-300 cursor-pointer;
        width: 100%;
        min-height: 2rem;
        gap: 0.25rem;
        padding-left: 0.5rem;
        .selection-display-container {
            @apply flex items-center;
            gap: 0.25rem;
        }
        .selection-display-wrapper {
            @apply flex flex-grow flex-shrink items-center text-label-md;
            width: 100%;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
            .placeholder {
                @apply text-gray-600;
            }
            .selection-wrapper {
                @apply flex flex-grow items-center text-gray-800;
                gap: 0.25rem;
                .selected-item-text {
                    @apply font-medium;
                }
                .selected-item-badge {
                    margin-left: 0.25rem;
                }
                .tags-wrapper {
                    @apply flex flex-wrap;
                    gap: 0.5rem;
                    > .selected-tag {
                        margin: 0;
                    }
                }
            }
        }
        .extra-button-wrapper {
            @apply flex flex-shrink-0;
            max-height: 2rem;
            .delete-all-button {
                @apply inline-flex items-center text-gray-400 cursor-pointer;
                width: 1rem;
            }
            .arrow-button {
                @apply inline-flex items-center text-gray-600 cursor-pointer;
                width: 1.75rem;
            }
        }

        .show-alert-dot {
            @apply absolute bg-blue-500 rounded-full border-2 border-white;
            top: -0.25rem;
            right: -0.063rem;
            width: 0.625rem;
            height: 0.625rem;
        }
    }

    /* hover */
    &:not(.disabled, .readonly, .invalid):hover {
        .dropdown-button {
            @apply border-secondary;
        }
    }

    &.disabled {
        @apply cursor-not-allowed;
        .dropdown-button {
            @apply bg-gray-100 border-gray-300 cursor-not-allowed;
            .arrow-button {
                @apply text-gray-300 cursor-not-allowed;
            }
        }
        .dropdown-icon-button {
            @apply cursor-not-allowed text-gray-300;
        }
        &.tertiary-icon-button {
            @apply bg-gray-200 rounded-default border-transparent;
        }
    }

    &.readonly {
        &:not(.has-items) {
            .dropdown-button {
                @apply text-gray-300;
                .selected-item {
                    @apply text-gray-800;
                }
                .arrow-button {
                    @apply text-gray-300;
                }
            }
        }
        .dropdown-button {
            @apply cursor-default;
            .arrow-button {
                @apply cursor-default;
            }
        }
        .dropdown-icon-button {
            @apply cursor-default;
        }
    }

    /* style type */
    &.rounded {
        .dropdown-button {
            @apply border-gray-200;
            border-radius: 0.75rem;
        }
        &.selected:not(.disabled, .readonly, .invalid, .selection-highlight) {
            .dropdown-button {
                @apply border-gray-400;
            }
        }
        &:not(.disabled, .readonly, .invalid):hover {
            .dropdown-button {
                @apply bg-gray-100 border-gray-200;
            }
            &.selected {
                .dropdown-button {
                    @apply border-gray-400;
                }
                &.selection-highlight {
                    .dropdown-button {
                        @apply bg-blue-200 border-blue-300;
                    }
                }
            }
        }
    }
    &.transparent {
        .dropdown-button {
            @apply border-none bg-transparent text-gray-900;
            padding-left: 0;
        }
        &:not(.disabled, .readonly, .invalid):hover {
            .arrow-button {
                @apply text-secondary;
            }
        }
    }
    &.icon-button, &.tertiary-icon-button {
        @apply flex items-center justify-center text-gray-900;
        width: 2rem;
        height: 2rem;
        &:not(.disabled, .readonly) {
            @apply cursor-pointer;
        }
        .dropdown-icon-button-wrapper {
            @apply flex items-center justify-center;
            width: 2rem;
            height: 2rem;
        }
    }
    &.icon-button {
        @apply rounded-full;
        &:not(.disabled, .readonly, .invalid):hover {
            @apply bg-blue-200 text-secondary;
        }
        .dropdown-button {
            @apply rounded-full;
        }
    }
    &.tertiary-icon-button {
        @apply border border-gray-300 rounded-default bg-white;
        &:not(.disabled, .readonly, .invalid):hover {
            @apply bg-gray-100;
        }
    }
    &.sm {
        .dropdown-button {
            @apply text-label-sm;
            min-height: 1.25rem;
            .selection-display-wrapper {
                @apply text-label-sm;
                padding: 0.25rem 0;
                .selection-wrapper {
                    .selected-item {
                        .selected-item-badge {
                            min-height: 1rem;
                            margin-left: 0;
                        }
                    }
                }
            }
            .extra-button-wrapper {
                .arrow-button {
                    width: 1.125rem;
                }
            }
        }
        &.badge {
            .selection-display-wrapper {
                padding: 3px 0;
            }
        }
        &.icon-button, &.tertiary-icon-button {
            width: 1.5rem;
            height: 1.5rem;
            .dropdown-icon-button-wrapper {
                @apply flex items-center justify-center rounded-full;
                width: 1.5rem;
                height: 1.5rem;
            }
        }
    }

    &.opened {
        &:not(.readonly) {
            .dropdown-button {
                @apply border-secondary;
                .arrow-button {
                    @apply text-secondary;
                }
            }
        }
        &.rounded:not(.readonly) {
            .dropdown-button {
                @apply bg-gray-100 border-gray-200;
            }
            .arrow-button {
                @apply text-gray-600;
            }
            &.selected {
                .dropdown-button {
                    @apply border-gray-400;
                }
                &.selection-highlight {
                    .dropdown-button {
                        @apply bg-blue-100 border-blue-300;
                    }
                    .arrow-button {
                        @apply text-secondary;
                    }
                }
            }
        }
        &.icon-button:not(.readonly) {
            @apply bg-blue-300 text-secondary;
        }
        &.tertiary-icon-button:not(.readonly) {
            @apply bg-gray-200 rounded-default;
        }
    }

    &.invalid {
        .dropdown-button {
            @apply border-alert;
        }
        &.opened {
            .dropdown-button {
                @apply border-alert;
            }
            .arrow-button {
                @apply text-gray-600;
            }
        }
        &.rounded {
            &:hover {
                .dropdown-button {
                    @apply bg-red-100;
                }
            }
            &.opened {
                .dropdown-button {
                    @apply bg-red-100 border-alert;
                }
                .arrow-button {
                    @apply text-gray-600;
                }
            }
        }
        &.tertiary-icon-button {
            @apply bg-gray-200 rounded-default;
        }
    }

    &.selection-highlight {
        .dropdown-button {
            @apply bg-blue-100 border-blue-300;
            .selection-wrapper {
                @apply text-secondary;
            }
        }
        .arrow-button {
            @apply text-secondary;
        }
        &:not(.disabled, .readonly, .invalid):hover {
            .dropdown-button {
                @apply bg-blue-200 border-blue-300;
            }
        }
    }

    &.is-fixed-width {
        .dropdown-button {
            .selection-display-container {
                @apply truncate;
                flex: 1;
                .selection-display-wrapper {
                    .placeholder, .selected-item {
                        @apply truncate;
                    }
                    .selection-wrapper {
                        width: 100%;
                    }
                    .selected-item {
                        @apply flex;
                        .selected-item-text {
                            @apply truncate;
                            flex: 1;
                        }
                    }
                }
            }
        }
    }
}
</style>
