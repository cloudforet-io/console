<template>
    <div class="p-card"
         :class="{
             [styleType]: true,
             [size]: true,
         }"
    >
        <header v-if="header !== false || $slots.header">
            <slot name="header">
                {{ header }}
            </slot>
        </header>
        <div class="body"
             :class="{ 'no-header': !header.length && !$slots.header }"
        >
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

import { CARD_STYLE_TYPE, CARD_SIZE } from '@/data-display/cards/card/config';

defineProps({
    header: {
        type: [String, Boolean],
        default: '',
    },
    styleType: {
        type: String,
        default: CARD_STYLE_TYPE.gray100,
        validator(styleType: any) {
            return Object.values(CARD_STYLE_TYPE).includes(styleType);
        },
    },
    size: {
        type: String,
        default: CARD_SIZE.md,
        validator(size: any) {
            return Object.values(CARD_SIZE).includes(size);
        },
    },
});

</script>

<style lang="postcss">
.p-card {
    header {
        @apply border-t border-r border-l rounded-t-lg;
        padding: 0.5rem 1rem;
        border-color: inherit;
    }
    .body {
        @apply border-b border-l border-r rounded-b-lg bg-white;
        padding: 0.75rem 0.875rem;
        border-color: inherit;
        &.no-header {
            @apply border rounded-t-lg;
            border-color: inherit;
        }
    }

    @define-mixin style-type $bg-color, $border-color, $font-color {
        border-color: $border-color;
        header {
            background-color: $bg-color;
            color: $font-color;
        }
    }

    @define-mixin size $header-height, $font-size, $line-height {
        header {
            min-height: $header-height;
            font-size: $font-size;
            line-height: $line-height;
        }
    }
    &.gray100 {
        @mixin style-type theme('colors.gray.100'), theme('colors.gray.200'), theme('colors.gray.900');
    }
    &.yellow100 {
        @mixin style-type theme('colors.yellow.100'), theme('colors.gray.200'), theme('colors.gray.500');
    }
    &.yellow500 {
        @mixin style-type theme('colors.yellow.500'), theme('colors.yellow.500'), theme('colors.white');
    }
    &.indigo400 {
        @mixin style-type theme('colors.indigo.400'), theme('colors.indigo.400'), theme('colors.white');
    }
    &.red400 {
        @mixin style-type theme('colors.red.400'), theme('colors.red.400'), theme('colors.white');
    }
    &.white {
        @mixin style-type theme('colors.white'), theme('colors.gray.200'), theme('colors.gray.900');
    }
    &.sm {
        @mixin size 1.875rem, 0.75rem, 1.17;
    }
    &.md {
        @mixin size 2.25rem, 1rem, 1.22;
    }
    &.lg {
        @mixin size 4rem, 1.5rem, 1.6;
        header {
            padding: 0.8125rem 1rem;
        }
    }
}
</style>
