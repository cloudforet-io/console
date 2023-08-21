<template>
    <span class="p-radio"
          :tabindex="0"
          :class="{readonly, selected: isSelected}"
          @click.stop.prevent="handleClick"
          @keypress.stop.prevent="handleClick"
          v-on="listeners"
    >
        <slot name="radio-left"
              v-bind="{isSelected}"
        />
        <slot :slot-scope="props"
              name="icon"
              v-bind="{isSelected, iconName}"
        >
            <p-i class="radio-icon"
                 :class="{disabled, invalid}"
                 width="1.25rem"
                 height="1.25rem"
                 :color="isSelected||disabled||readonly ? undefined : 'inherit transparent'"
                 :name="iconName"
            />
        </slot>
        <span v-if="slots.default"
              class="text"
              :class="{disabled, invalid}"
              @click.stop="handleClick"
        >
            <slot name="default"
                  v-bind="{isSelected}"
            />
        </span>
    </span>
</template>

<script setup lang="ts">
import {
    computed, useAttrs, useSlots,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';
import type { SelectProps } from '@/hooks/select';
import { useSingleSelect } from '@/hooks/select';

interface Props extends SelectProps {
    invalid?: boolean;
    readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    value: true,
    disabled: false,
    invalid: false,
    readonly: false,
});
const emit = defineEmits<{(e: 'change', selected: any, isSelected: boolean): void;
    (e: 'update:selected', selected: any): void;
}>();
const attrs = useAttrs();
const slots = useSlots();

const {
    isSelected,
    getSelected,
} = useSingleSelect({
    value: computed(() => props.value),
    selected: computed(() => props.selected),
    predicate: computed(() => props.predicate),
    disabled: computed(() => props.disabled),
});

const iconName = computed(() => {
    if (props.disabled) return 'ic_radio-disabled';
    if (isSelected.value) return 'ic_radio-selected';
    return 'ic_radio';
});

/* event */
const handleClick = () => {
    if (props.disabled || props.readonly) return;
    const newSelected = getSelected();
    emit('change', newSelected, true);
    emit('update:selected', newSelected);
};

const listeners = {
    ...attrs,
};

</script>

<style lang="postcss">
.p-radio {
    vertical-align: middle;
    line-height: 1.07rem;
    &.readonly {
        cursor: text;
        .radio-icon {
            cursor: default;
        }
        &:not(.selected) {
            .radio-icon {
                @apply text-gray-400;
            }
            .text {
                @apply text-gray-400;
            }
        }
    }

    @media (hover: hover) {
        &:hover:not(.readonly) {
            .text {
                @apply text-blue-600 cursor-pointer;
            }
            .radio-icon {
                @apply text-gray-900 cursor-pointer;
            }
            .disabled {
                @apply text-gray-400;
            }
            .invalid {
                @apply text-red-500 cursor-pointer;
            }
        }
    }

    .text {
        @apply text-gray-900;
        font-weight: 400;
        font-size: 0.875rem;
    }
    .radio-icon {
        @apply text-gray-400;
    }
    .disabled {
        @apply text-gray-400;
        cursor: not-allowed;
    }
    .invalid {
        @apply text-red-500;
    }

    &:not(.readonly) {
        &:focus, &:active, &:focus-within {
            .radio-icon {
                outline: 1px auto theme('colors.gray.400');
            }
        }
    }
}
</style>
