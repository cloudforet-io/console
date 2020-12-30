<template>
    <span class="p-radio"
          :class="{
              selected: isSelected,
              disabled, errored
          }"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <slot name="radio-left" />
        <input type="radio">
        <slot :slot-scope="$props" name="icon" :icon-name="iconName">
            <p-i class="radio-icon" width="1.25rem" height="1.25rem"
                 :color="isSelected ? undefined : 'inherit transparent'"
                 :name="iconName"
            />
        </slot>
        <span v-if="$scopedSlots.default" class="text" @click.stop="onClick">
            <slot name="default" />
        </span>
    </span>
</template>

<script lang="ts">
import { ref, computed } from '@vue/composition-api';
import PI from '@/atoms/icons/PI.vue';

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
        errored: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const isSelected = computed(() => props.selected === props.value);

        const onClick = () => {
            if (!isSelected.value) {
                if (typeof props.selected === 'object') {
                    if (props.selected instanceof Array) emit('change', [...props.value], isSelected.value);
                    else emit('change', { ...props.value }, isSelected.value);
                } else emit('change', props.value, isSelected.value);
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
        height: 0;
        width: 0;
    }
    &:hover {
        .radio-icon {
            @apply text-gray-900;
        }
    }
    &:not(:hover) {
        .radio-icon {
            @apply text-gray-300;
        }
    }
    .radio-icon {
        @apply cursor-pointer;
    }
    .text {
        @apply cursor-pointer;
    }
    .disabled {
        .text {
            @apply cursor-not-allowed;
        }
    }
}
</style>
