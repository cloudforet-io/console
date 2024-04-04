<script setup lang="ts">
import type { TranslateResult } from 'vue-i18n';

import { PI } from '@spaceone/design-system';

type StyleType = 'gray' | 'secondary' | 'peacock';

const props = withDefaults(defineProps<{
    styleType?: StyleType;
    message?: string|TranslateResult;
    block?: boolean;
}>(), {
    styleType: 'gray',
    message: '',
    block: false,
});
</script>

<template>
    <span class="info-message"
          :class="{[props.styleType]: true, block: props.block}"
    >
        <p-i name="ic_info-circle"
             color="inherit"
             height="1em"
             width="1em"
        />
        <span class="message">
            <slot>{{ props.message }}</slot>
        </span>
    </span>
</template>

<style lang="postcss" scoped>
.info-message {
    font-size: 0.75rem;
    vertical-align: middle;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    .message {
        line-height: 1.5;
        margin-left: 0.25rem;
    }
    &.gray {
        @apply text-gray-700;
    }
    &.secondary {
        @apply text-secondary;
    }
    &.peacock {
        @apply text-peacock-500;
    }
}
</style>
