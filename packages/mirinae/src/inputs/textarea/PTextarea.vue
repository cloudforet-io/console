<template>
    <textarea v-model="state.proxyValue"
              :placeholder="state.stringifiedPlaceholder"
              :readonly="readonly"
              :autofocus="autofocus"
              :disabled="disabled"
              class="p-textarea"
              :class="{invalid}"
              v-on="listeners"
    />
</template>

<script setup lang="ts">
import {
    computed,
    reactive, useAttrs,
} from 'vue';

import { useProxyValue } from '@/hooks';

interface Props {
    value: string | number;
    placeholder: string | number;
    autofocus: boolean;
    readonly: boolean;
    disabled: boolean;
    invalid: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    value: '',
    placeholder: '',
    autofocus: false,
    readonly: false,
    disabled: false,
    invalid: false,
});
const emit = defineEmits(['update:value']);
const attrs = useAttrs();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    stringifiedPlaceholder: computed(() => `${props.placeholder}`),
});
const listeners = {
    ...attrs,
};

</script>

<style lang="postcss">
.p-textarea {
    @apply bg-white border border-gray-300 rounded text-gray-900;
    width: 100%;
    min-height: 4rem;
    padding: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.2;
    &:read-only {
        &:active, &:focus {
            outline: none;
        }
    }
    &:active:not(:disabled):not(:read-only):not(.invalid),
    &:focus:not(:disabled):not(:read-only):not(.invalid) {
        @apply border-secondary;
    }
    &:disabled {
        @apply bg-gray-100 text-gray-300;
    }
    &.invalid:not(:disabled):not(:read-only) {
        @apply border-alert;
    }
    &::placeholder {
        @apply text-gray-300;
    }

    @media (hover: hover) {
        &:hover:not(:disabled):not(:read-only):not(.invalid):not(:active):not(:focus) {
            @apply border-gray-900;
        }
    }
}
</style>
