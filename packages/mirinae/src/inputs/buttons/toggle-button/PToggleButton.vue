<template>
    <label class="p-toggle-button"
           :class="{'disabled': props.disabled}"
    >
        <input role="switch"
               type="checkbox"
               class="slider"
               :class="[props.styleType]"
               :disabled="props.disabled"
               :checked="state.proxyValue"
               @change="handleChangeToggle"
        >
        <span v-if="!!props.label"
              class="label"
        >
            {{ props.label }}
        </span>
    </label>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { useProxyValue } from '@/hooks';
import { TOGGLE_BUTTON_THEME } from '@/inputs/buttons/toggle-button/config';

interface ToggleButtonProps {
    value: boolean,
    label?: string,
    styleType?: TOGGLE_BUTTON_THEME,
    disabled?: boolean,
}
const props = withDefaults(defineProps<ToggleButtonProps>(), {
    value: false,
    label: '',
    styleType: TOGGLE_BUTTON_THEME.secondary,
    disabled: false,
});
const emit = defineEmits<{(e: 'change-toggle', value: boolean): void;}>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
});
const handleChangeToggle = () => {
    state.proxyValue = !state.proxyValue;
    emit('change-toggle', !props.value);
};
</script>

<style lang="postcss">
.p-toggle-button {
    @apply inline-flex items-center cursor-pointer;
    .slider {
        @apply relative bg-gray-300 cursor-pointer appearance-none;
        width: 2rem;
        height: 1rem;
        border-radius: 6.25rem;
        &::before {
            @apply absolute bg-white;
            content: '';
            width: 0.75rem;
            height: 0.75rem;
            top: 0.125rem;
            left: 0.125rem;
            border-radius: 50%;
            transition: left 300ms ease-in-out;
            -webkit-transition: left 300ms ease-in-out;
            -moz-transition: left 300ms ease-in-out;
        }
        &:checked {
            &::before {
                left: 1.125rem;
            }
            &.secondary {
                @apply bg-blue-600;
                &:disabled {
                    @apply bg-blue-300;
                }
            }
            &.peacock500 {
                @apply bg-peacock-500;
                &:disabled {
                    @apply bg-peacock-200;
                }
            }
        }
    }
    .label {
        margin-left: 0.875rem;
    }
    &.disabled {
        @apply cursor-not-allowed;
        .slider {
            @apply bg-gray-200 cursor-not-allowed;
        }
        .label {
            @apply text-gray-300;
        }
    }
}
</style>
