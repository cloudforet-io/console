<template>
    <label class="p-toggle-button"
           :class="[props.position, props.spacing, {'disabled': props.disabled, 'is-active': state.proxyValue}]"
    >
        <input role="switch"
               type="checkbox"
               class="slider"
               :disabled="props.disabled"
               :checked="state.proxyValue"
               @change="handleChangeToggle"
        >
        <span v-if="props.showStateText"
              class="state-text"
        >
            {{ state.proxyValue ? 'ON' : 'OFF' }}
        </span>

    </label>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { useProxyValue } from '@/hooks';

interface ToggleButtonProps {
    value: boolean,
    disabled?: boolean,
    showStateText?: boolean,
    spacing?: 'sm' | 'md' | 'space-between',
    position?: 'left' | 'right',
}
const props = withDefaults(defineProps<ToggleButtonProps>(), {
    value: false,
    disabled: false,
    showStateText: false,
    position: 'right',
    spacing: 'sm',
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

    &.none {
        gap: 0;
    }

    &.sm {
        gap: 0.25rem;
    }

    &.md {
        gap: 0.5rem;
    }

    &.lg {
        gap: 1rem;
    }

    &.space-between {
        justify-content: space-between;
    }

    &.right {
        flex-direction: row;
    }

    &.left {
        flex-direction: row-reverse;
    }

    &.top {
        flex-direction: column-reverse;
    }

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
            @apply bg-blue-600;
            &:disabled {
                @apply bg-blue-600 opacity-50;
            }
            &::before {
                left: 1.125rem;
            }
        }

        &:focus {
            box-shadow: 0 0 0 2px rgba(73, 167, 247, 20%);
        }
    }

    &.is-active {
        .state-text {
            @apply text-blue-600;
        }
    }
    .state-text {
        @apply text-label-md text-gray-300;
    }

    &.disabled {
        @apply cursor-not-allowed;

        .slider {
            @apply bg-gray-200 cursor-not-allowed;
        }

        .state-text {
            @apply opacity-50;
        }
    }
}
</style>
