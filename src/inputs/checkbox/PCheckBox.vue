<template>
    <span class="p-checkbox"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <input type="checkbox">
        <slot :slot-scope="$props" name="icon" v-bind="{isSelected}">
            <p-i width="1.25rem" height="1.25rem"
                 class="check-icon"
                 :class="{disabled,invalid}"
                 :color="isSelected||disabled ? undefined : 'inherit transparent'"
                 :name="iconName"
            />
        </slot>
        <span v-if="$scopedSlots.default"
              class="text"
              :class="{disabled,invalid}"
              @click.stop="onClick"
        >
            <slot name="default" v-bind="{isSelected}" />
        </span>
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent, toRefs,
} from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import { useMultiSelect, SelectProps } from '@/hooks/select';

interface CheckboxProps extends SelectProps {
    invalid?: boolean;
}

export default defineComponent<CheckboxProps>({
    name: 'PCheckBox',
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
    setup(props: CheckboxProps, context) {
        const { state, onClick } = useMultiSelect(props, context);
        const iconName = computed(() => {
            if (props.disabled) return 'ic_checkbox--disabled';
            if (state.isSelected) return 'ic_checkbox--checked';
            return 'ic_checkbox';
        });

        return {
            ...toRefs(state),
            onClick,
            iconName,
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

    &:hover {
        .text {
            @apply text-blue-500;
        }
        .check-icon {
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
        font-size: 14px;
    }
    .check-icon {
        @apply text-gray-400 cursor-pointer;
    }
    .disabled {
        @apply text-gray-400;
        cursor: not-allowed;
    }
    .invalid {
        @apply text-red-500 cursor-pointer;
    }
}

</style>
