<template>
    <span class="p-field-title"
          v-on="$listeners"
    >
        <span class="title">
            <slot>
                {{ props.label }}
            </slot>
        </span>
        <span v-if="props.description"
              class="description"
        >
            {{ props.description }}
        </span>
    </span>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

interface FieldTitleProps {
    label?: string;
    description?: string;
}

const props = withDefaults(defineProps<FieldTitleProps>(), {
    label: '',
    description: undefined,
});

</script>

<style lang="postcss">
.p-field-title {
    @apply text-gray-900;
    display: inline-block;
    letter-spacing: 0;
    margin-bottom: 0.25rem;
    > .title {
        @apply text-label-md font-bold;
        display: block;
    }
    > .description {
        @apply text-paragraph-md font-normal;
    }
}
</style>
