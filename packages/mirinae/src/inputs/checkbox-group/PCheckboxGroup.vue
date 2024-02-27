<script setup lang="ts">
import type { Direction } from '@/inputs/checkbox-group/type';
import { DIRECTION } from '@/inputs/checkbox-group/type';

interface CheckboxGroupProps {
    direction?: Direction;
}

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
    direction: DIRECTION.horizontal,
});

</script>

<template>
    <div class="p-checkbox-group"
         :class="props.direction"
    >
        <slot name="default" />
    </div>
</template>

<style lang="postcss">
.p-checkbox-group {
    &.horizontal {
        .p-checkbox {
            @apply inline-block;
            margin-right: 1rem;
        }
    }
    &.vertical {
        @apply flex flex-col row-gap-2;
    }
}
</style>
