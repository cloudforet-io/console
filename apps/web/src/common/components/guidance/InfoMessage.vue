<script lang="ts" setup>
import { PI } from '@spaceone/design-system';

const STYLE_TYPE = Object.freeze({
    gray: 'gray',
    secondary: 'secondary',
    peacock: 'peacock',
} as const);
type StyleType = typeof STYLE_TYPE[keyof typeof STYLE_TYPE];

interface Props {
    styleType: StyleType,
    message: string,
    block: boolean,
}

withDefaults(defineProps<Props>(), {
    styleType: 'gray',
    message: '',
    block: false,
});
</script>

<template>
    <span class="info-message"
          :class="{[styleType]: true, block}"
    >
        <p-i name="ic_info-circle"
             color="inherit"
             height="1em"
             width="1em"
        />
        <span class="message">
            <slot>{{ message }}</slot>
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
