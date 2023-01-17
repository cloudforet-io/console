<template>
    <textarea v-model="proxyValue"
              :placeholder="placeholder"
              :readonly="readonly"
              :autofocus="autofocus"
              :disabled="disabled"
              class="p-textarea"
              :class="{invalid}"
              v-on="$listeners"
    />
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { makeOptionalProxy } from '@/utils/composition-helpers';

export default defineComponent({
    name: 'PTextarea',
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: [String, Number],
            default: '',
        },
        placeholder: {
            type: [String, Number],
            default: '',
        },
        autofocus: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
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
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            proxyValue: makeOptionalProxy('value', vm, props.value),
        });
        return {
            ...toRefs(state),
        };
    },
});
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
