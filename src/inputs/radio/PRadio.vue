<template>
    <span class="p-radio"
          :tabindex="0"
          @click.stop.prevent="handleClick"
          @keypress.stop.prevent="handleClick"
          v-on="$listeners"
    >
        <slot name="radio-left"
              v-bind="{isSelected}"
        />
        <slot :slot-scope="$props"
              name="icon"
              v-bind="{isSelected, iconName}"
        >
            <p-i class="radio-icon"
                 :class="{disabled,invalid}"
                 width="1.25rem"
                 height="1.25rem"
                 :color="isSelected||disabled ? undefined : 'inherit transparent'"
                 :name="iconName"
            />
        </slot>
        <span v-if="$scopedSlots.default"
              class="text"
              :class="{disabled,invalid}"
              @click.stop="handleClick"
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
import { useSingleSelect } from '@/hooks/select';

interface Props extends SelectProps {
    invalid?: boolean;
}
export default defineComponent<Props>({
    name: 'PRadio',
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
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        predicate: {
            type: Function,
            default: undefined,
        },
        /* radio props */
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
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
            if (props.disabled) return 'ic_radio--disabled';
            if (isSelected.value) return 'ic_radio--checked';
            return 'ic_radio';
        });

        /* event */
        const handleClick = () => {
            if (props.disabled) return;
            const newSelected = getSelected();
            emit('change', newSelected, true);
        };

        return {
            isSelected,
            iconName,
            handleClick,
        };
    },
});
</script>

<style lang="postcss">
.p-radio {
    vertical-align: middle;
    line-height: 1.07rem;
    &:hover {
        .text {
            @apply text-blue-600;
        }
        .radio-icon {
            @apply text-gray-900;
        }
        .disabled {
            @apply text-gray-400;
        }
        .invalid {
            @apply text-red-500;
        }
    }

    .text {
        @apply text-gray-900 cursor-pointer;
        font-weight: 400;
        font-size: 0.875rem;
    }
    .radio-icon {
        @apply text-gray-400 cursor-pointer;
    }
    .disabled {
        @apply text-gray-400;
        cursor: not-allowed;
    }
    .invalid {
        @apply text-red-500 cursor-pointer;
    }

    &:focus, &:active, &:focus-within {
        .radio-icon {
            outline: 1px auto theme('colors.gray.400');
        }
    }
}
</style>
