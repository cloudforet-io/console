<template>
    <span class="p-radio"
          :tabindex="0"
          @click.stop.prevent="onClick"
          @keypress.stop.prevent="onClick"
          v-on="$listeners"
    >
        <slot name="radio-left" v-bind="{isSelected}" />
        <slot :slot-scope="$props" name="icon"
              v-bind="{isSelected, iconName}"
        >
            <p-i class="radio-icon"
                 :class="{disabled,invalid}"
                 width="1.25rem" height="1.25rem"
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
    computed, toRefs, defineComponent,
} from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import { SelectProps, useSingleSelect } from '@/hooks/select';

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
    setup(props: Props, context) {
        const { state, onClick } = useSingleSelect(props, context);

        const iconName = computed(() => {
            if (props.disabled) return 'ic_radio--disabled';
            if (state.isSelected) return 'ic_radio--checked';
            return 'ic_radio';
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
.p-radio {
    &:hover {
        .text {
            @apply text-blue-500;
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
