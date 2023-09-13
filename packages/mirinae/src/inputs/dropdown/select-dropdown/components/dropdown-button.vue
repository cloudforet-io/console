<script setup lang="ts">
import { toRef } from 'vue';

import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import {
    useSelectDropdownButtonDisplay,
} from '@/inputs/dropdown/select-dropdown/composables/select-dropdown-button-display';
import {
    SELECT_DROPDOWN_APPEARANCE_TYPE,
    SELECT_DROPDOWN_STYLE_TYPE,
} from '@/inputs/dropdown/select-dropdown/type';
import type {
    SelectDropdownAppearanceType, SelectDropdownMenuItem, SelectDropdownStyleType,
} from '@/inputs/dropdown/select-dropdown/type';

interface Props {
    styleType?: SelectDropdownStyleType;
    appearanceType?: SelectDropdownAppearanceType;
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

const props = withDefaults(defineProps<Props>(), {
    styleType: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
    appearanceType: SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC,
    placeholder: undefined,
    selectionLabel: undefined,
    showDeleteAllButton: false,
    buttonIcon: undefined,
    isVisibleMenu: undefined,
    selectedItems: undefined,
});

/* event emits */
const emit = defineEmits<{(e: 'click-delete', item?: SelectDropdownMenuItem, idx?: number): void;
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
    if (props.selectedItems.length) {
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
        [props.styleType]: true,
        invalid: props.invalid,
        disabled: props.disabled,
        readonly: props.readonly,
        opened: props.isVisibleMenu,
        selected: props.selectedItems.length > 0,
        'is-fixed-width': props.isFixedWidth,
        'selection-highlight': props.selectionHighlight && props.selectedItems.length > 0,
    }"
    >
        <span v-if="props.styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON"
              class="dropdown-icon-button-wrapper"
        >
            <p-i :name="props.buttonIcon || (props.isVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down')"
                 color="inherit"
                 width="1.5rem"
                 height="1.5rem"
                 class="dropdown-icon-button"
                 @click="emit('click-dropdown-button')"
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
            <span v-if="props.showAlertDot"
                  class="show-alert-dot"
            />
            <slot name="input-left-area" />
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
                                 :style-type="props.disabled ? 'gray200' : 'blue200'"
                                 :badge-type="props.disabled ? 'solid' : 'subtle'"
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
                               @delete="handleTagDelete(item, idx)"
                        >
                            {{ item.label || item.name }}
                        </p-tag>
                    </div>
                </span>
            </div>
            <div class="extra-button-wrapper">
                <span v-if="props.showDeleteAllButton && props.selectedItems.length > 0"
                      class="delete-all-button"
                      @click.stop="handleClickDeleteAll"
                >
                    <p-i name="ic_close"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                </span>
                <span class="arrow-button"
                      @click.stop="emit('click-dropdown-button')"
                >
                    <p-i :name="props.isVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                         width="1.5rem"
                         height="1.5rem"
                         color="inherit"
                    />
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dropdown-button-component {
    /* style type - default */
    .dropdown-button {
        @apply flex items-center bg-white font-normal border rounded-md border-gray-300 cursor-pointer;
        width: 100%;
        min-height: 2rem;
        gap: 0.25rem;
        .selection-display-wrapper {
            @apply flex flex-grow flex-shrink items-center text-label-md;
            width: 100%;
            min-height: 2rem;
            padding-left: 0.5rem;
            .placeholder {
                @apply text-gray-500;
            }
            .selection-wrapper {
                @apply flex flex-grow items-center text-gray-800;
                gap: 0.25rem;
                .selected-item-text {
                    @apply font-medium;
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
        .dropdown-button {
            @apply bg-gray-100 border-gray-300 cursor-not-allowed;
            .arrow-button {
                @apply text-gray-300 cursor-not-allowed;
            }
        }
        .dropdown-icon-button {
            @apply cursor-not-allowed text-gray-300;
        }
    }

    &.readonly {
        .dropdown-button {
            @apply text-gray-300 border-gray-300 cursor-default;
            .selected-item {
                @apply text-gray-800;
            }
            .arrow-button {
                @apply text-gray-300 cursor-default;
            }
        }
        .dropdown-icon-button {
            @apply text-gray-300 cursor-default;
        }
    }

    /* style type */
    &.rounded {
        .dropdown-button {
            @apply border-gray-200 rounded-xl;
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
    &.icon-button {
        @apply flex items-center justify-center text-gray-600 cursor-pointer;
        width: 2rem;
        height: 2rem;
        .dropdown-icon-button-wrapper {
            @apply flex items-center justify-center rounded-full;
            width: 2rem;
            height: 2rem;
        }
        &:not(.disabled, .readonly, .invalid):hover {
            .dropdown-icon-button {
                @apply text-secondary;
            }
        }
    }

    &.opened {
        .dropdown-button {
            @apply border-secondary;
            .arrow-button {
                @apply text-secondary;
            }
        }
        &.rounded {
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
        &.icon-button {
            .dropdown-icon-button-wrapper {
                @apply bg-blue-300;
                .dropdown-icon-button {
                    @apply text-secondary;
                }
            }
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
            .selection-display-wrapper {
                flex: 1;
                width: calc(100% - 3rem);
                .placeholder, .selected-item-text {
                    @apply truncate;
                }
            }
        }
    }
}
</style>
