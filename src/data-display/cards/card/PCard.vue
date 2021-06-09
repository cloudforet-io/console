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
            default: CARD_STYLE_TYPE.gray,
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
    @apply border border-gray-200 rounded-lg;
    header {
        @apply text-gray-500 rounded-t-lg border-b border-gray-200;
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
        line-height: 1.5;
        min-height: 2rem;
    }
    .body {
        padding: 0.75rem 0.875rem;
    }

    @define-mixin style-type $bg-color {
        header {
            background-color: $bg-color;
        }
    }

    &.gray { @mixin style-type theme('colors.gray.100'); }
    &.yellow { @mixin style-type theme('colors.yellow.100'); }
}
</style>
