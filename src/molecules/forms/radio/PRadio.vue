<template>
    <span class="p-radio"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <slot name="radio-left" />
        <input type="radio">
        <slot :slot-scope="$props" name="icon" :icon-name="iconName">
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
            <slot name="default" />
        </span>
    </span>
</template>

<script>
import { reactive, computed, toRefs } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'PRadio',
    events: ['change'],
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        selected: [Boolean, String, Number, Object, Array],
        value: {
            type: [Boolean, String, Number, Object, Array],
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const isSelected = computed(() => props.selected === props.value);
        const onClick = () => {
            if (!props.disabled) {
                if (!isSelected.value) {
                    if (typeof props.selected === 'object') {
                        if (props.selected instanceof Array) emit('change', [...props.value], isSelected.value);
                        else emit('change', { ...props.value }, isSelected.value);
                    } else emit('change', props.value, isSelected.value);
                }
            }
        };
        const iconName = computed(() => {
            if (props.disabled) return 'ic_radio--disabled';
            if (isSelected.value) return 'ic_radio--checked';
            return 'ic_radio';
        });
        return {
            isSelected,
            iconName,
            onClick,
        };
    },
};
</script>

<style lang="postcss">
.p-radio {

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

}
</style>
