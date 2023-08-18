<template>
    <div class="p-field-title"
         :class="{inline: props.inline}"
         v-on="listeners"
    >
        <div class="title-wrapper">
            <slot name="left"
                  class="left-slot"
            />
            <span class="title"
                  :class="[size, fontWeight, color]"
            >
                <slot>
                    {{ props.label }}
                </slot>
            </span>
            <slot name="right"
                  class="right-slot"
            />
        </div>
        <div v-if="props.description">
            <span class="description">
                {{ props.description }}
            </span>
        </div>
        <slot name="bottom" />
    </div>
</template>

<script lang="ts" setup>
import { defineProps, useAttrs } from 'vue';

interface FieldTitleProps {
    label?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg';
    fontWeight?: 'regular' | 'bold';
    color?: 'dark' | 'gray';
    inline?: boolean;
}

const props = withDefaults(defineProps<FieldTitleProps>(), {
    label: '',
    description: undefined,
    size: 'md',
    fontWeight: 'bold',
    color: 'dark',
    inline: false,
});
const attrs = useAttrs();
const listeners = { ...attrs };

</script>

<style lang="postcss">
.p-field-title {
    @apply flex flex-col text-gray-900;
    letter-spacing: 0;
    &.inline {
        display: inline-flex;
    }

    .title-wrapper {
        @apply flex;
        gap: 0.25rem;

        .left-slot, .right-slot {
            width: 1rem;
            height: 1rem;
        }

        .title {
            @apply block text-label-md font-bold;
            &.sm {
                @apply text-label-sm;
            }
            &.lg {
                @apply text-label-lg;
            }
            &.regular {
                @apply font-normal;
            }
            &.gray {
                @apply text-gray-600;
            }
        }
    }
    .description {
        @apply block text-paragraph-sm font-normal;
        margin-top: 0.25rem;
    }
}
</style>
