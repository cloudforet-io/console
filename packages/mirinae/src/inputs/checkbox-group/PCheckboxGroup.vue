<template>
    <div class="p-checkbox-group"
         :class="direction"
    >
        <slot name="default" />
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import type { Direction } from '@/inputs/checkbox-group/type';
import { DIRECTION } from '@/inputs/checkbox-group/type';

defineProps({
    direction: {
        type: String as PropType<Direction>,
        default: DIRECTION.horizontal,
        validator(value: Direction) {
            return Object.values(DIRECTION).includes(value);
        },
    },
});

</script>

<style lang="postcss">
.p-checkbox-group {
    &.horizontal {
        .p-checkbox {
            @apply inline-block;
            margin-right: 1rem;
        }
    }
    &.vertical {
        @apply flex flex-col row-gap-1;
    }
}
</style>
