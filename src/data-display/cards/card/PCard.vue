<template>
    <div class="p-card" :class="styleType">
        <header v-if="header !== false || $scopedSlots.header">
            <slot name="header">
                {{ header }}
            </slot>
        </header>
        <div class="body">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { CARD_STYLE_TYPE } from '@/data-display/cards/card/config';
import { CardProps } from '@/data-display/cards/card/type';


export default defineComponent<CardProps>({
    name: 'PCard',
    props: {
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
    },
    setup() {
        return {};
    },
});
</script>

<style lang="postcss">
.p-card {
    @apply overflow-hidden border rounded-lg;
    header {
        padding: 0.5rem 1rem;
    }
    .body {
        padding: 0.75rem 0.875rem;
    }

    @define-mixin style-type $bg-color, $border-color {
        border-color: $border-color;
        header {
            @apply text-gray-500;
            min-height: 1.875rem;
            font-size: 0.75rem;
            line-height: 1.2;
            background-color: $bg-color;
            border-color: $border-color;
        }
    }

    @define-mixin style-type2 $bg-color, $border-color {
        border-color: $border-color;
        header {
            @apply font-bold text-white;
            min-height: 2.25rem;
            font-size: 1rem;
            line-height: 1.2;
            background-color: $bg-color;
            border-color: $border-color;
        }
    }
    &.gray100 {
        @mixin style-type theme('colors.gray.100'), theme('colors.gray.200');
    }
    &.yellow100 {
        @mixin style-type theme('colors.yellow.100'), theme('colors.gray.200');
    }
    &.yellow500 {
        @mixin style-type2 theme('colors.yellow.500'), theme('colors.yellow.500');
    }
    &.indigo400 {
        @mixin style-type2 theme('colors.indigo.400'), theme('colors.indigo.400');
    }
    &.red400 {
        @mixin style-type2 theme('colors.red.400'), theme('colors.red.400');
    }
}
</style>
