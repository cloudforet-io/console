<template>
    <span class="p-checkbox"
          :class="{disabled, invalid}"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <input type="checkbox">
        <slot :slot-scope="$props"
              name="icon"
              v-bind="{isSelected}"
        >
            <p-i width="1.25rem"
                 height="1.25rem"
                 class="check-icon"
                 :color="isSelected||disabled ? undefined : 'inherit transparent'"
                 :name="iconName"
            />
        </slot>
        <span v-if="$scopedSlots.default"
              class="text"
              @click.stop="onClick"
        >
            <slot name="default"
                  v-bind="{isSelected}"
            />
        </span>
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';
import type { SelectProps } from '@/hooks/select';
import { useMultiSelect } from '@/hooks/select';

interface CheckboxProps extends SelectProps {
    invalid?: boolean;
}

export default defineComponent<CheckboxProps>({
    name: 'PCheckbox',
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        /* select props */
        value: {
            type: [Boolean, String, Number, Object, Array],
            default: true,
        },
        selected: {
            type: [Boolean, String, Number, Object, Array],
            default: () => ([]),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        predicate: {
            type: Function,
            default: undefined,
        },
        /* checkbox props */
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: CheckboxProps, { emit }) {
        const {
            isSelected,
            getSelected,
        } = useMultiSelect({
            value: computed(() => props.value),
            selected: computed(() => props.selected),
            predicate: computed(() => props.predicate),
            disabled: computed(() => props.disabled),
        });

        const iconName = computed(() => {
            if (props.disabled) {
                if (isSelected.value) return 'ic_checkbox-disabled-check';
                return 'ic_checkbox--disabled';
            }
            if (isSelected.value) return 'ic_checkbox--checked';
            return 'ic_checkbox';
        });

        /* event */
        const onClick = () => {
            if (!props.disabled) {
                const newSelected = getSelected();
                emit('change', newSelected, !isSelected.value);
            }
        };

        return {
            isSelected,
            iconName,
            onClick,
        };
    },
});
</script>

<style lang="postcss">
.p-checkbox {

    input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }

    > .text {
        @apply text-gray-900 cursor-pointer;
        font-weight: 400;
        font-size: 14px;
        vertical-align: middle;
    }
    > .check-icon {
        @apply text-gray-400 cursor-pointer;
    }

    @media (hover: hover) {
        &:hover:not(.disabled) {
            &:not(.invalid) {
                > .check-icon {
                    @apply text-gray-900;
                }
            }
            > .text {
                @apply text-blue-600;
            }
        }
    }

    &.disabled {
        > .check-icon {
            @apply text-gray-400;
            cursor: not-allowed;
        }
        > .text {
            @apply text-gray-400;
            cursor: not-allowed;
        }
    }
    &.invalid {
        > .check-icon {
            @apply text-red-500;
        }
    }
}

</style>
