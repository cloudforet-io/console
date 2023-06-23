<template>
    <label class="p-toggle-button"
           :class="[props.position, props.spacing, {'disabled': props.disabled}]"
    >
        <input role="switch"
               type="checkbox"
               class="slider"
               :class="[props.styleType]"
               :disabled="props.disabled"
               :checked="state.proxyValue"
               @change="handleChangeToggle"
        >
        <slot v-if="props.showStateText"
              name="state-text"
        >
            <span class="state-text">
                {{ state.proxyStateText }}
            </span>
        </slot>

    </label>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { useProxyValue } from '@/hooks';
import { TOGGLE_BUTTON_THEME } from '@/inputs/buttons/toggle-button/config';

interface ToggleButtonProps {
    value: boolean,
    styleType?: TOGGLE_BUTTON_THEME,
    disabled?: boolean,
    showStateText?: boolean,
    stateText?: string,
    spacing?: 'sm' | 'md' | 'lg' | 'space-between' | 'none',
    position?: 'left' | 'right' | 'top',
}
const props = withDefaults(defineProps<ToggleButtonProps>(), {
    value: false,
    styleType: TOGGLE_BUTTON_THEME.secondary,
    disabled: false,
    showStateText: false,
    stateText: undefined,
    position: 'right',
    spacing: 'sm',
});
const emit = defineEmits<{(e: 'change-toggle', value: boolean): void;}>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    proxyStateText: computed(() => props.stateText || (state.proxyValue ? 'ON' : 'OFF')),
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

        &:focus {
            box-shadow: 0 0 0 2px rgba(73, 167, 247, 0.2);
        }
    }

    .state-text {
        @apply font-bold text-label-md;
    }

    &.disabled {
        @apply cursor-not-allowed;
        .slider {
            @apply bg-gray-200 cursor-not-allowed;
        }
    }
}
</style>
