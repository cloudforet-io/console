<script setup lang="ts">
import { PI } from '@cloudforet/mirinae';

import { TASK_STATUS_COLOR_NAMES } from '@/api-clients/opsflow/task/schema/constant';
import type { TaskStatusColorName } from '@/api-clients/opsflow/task/schema/type';

const props = defineProps<{
    color?: TaskStatusColorName;
}>();
const emit = defineEmits<{(event: 'update:color', value: TaskStatusColorName): void;
}>();
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span v-for="colorName in TASK_STATUS_COLOR_NAMES"
              :key="colorName"
              :class="colorName"
              class="color-picker-chip"
              @click="emit('update:color', colorName)"
        >
            <p-i v-if="props.color === colorName"
                 name="ic_check"
                 class="chip-check-mark"
                 height="1rem"
                 width="1rem"
                 color="inherit"
            />
        </span>
    </div>
</template>

<style scoped lang="postcss">
@define-mixin color-chip-style $theme, $bg-color, $border-color, $text-color, $outline-color {
    &.$(theme) {
        background-color: $bg-color;
        border-color: $border-color;
        .chip-check-mark {
            color: $text-color;
        }

        @media (hover: hover) {
            &:hover {
                outline-color: $outline-color;
            }
        }
    }
}
.color-picker-chip {
    @apply inline-flex items-center justify-center cursor-pointer rounded-full border;
    height: 24px;
    width: 24px;
    .chip-check-mark {
        border-radius: 100%;
    }

    @media (hover: hover) {
        &:hover {
            outline-width: 2px;
            outline-style: solid;
        }
    }

    @mixin color-chip-style gray200, theme('colors.gray.200'), theme('colors.gray.300'), theme('colors.gray.700'), theme('colors.gray.100');
    @mixin color-chip-style violet200, theme('colors.violet.200'), theme('colors.violet.300'), theme('colors.violet.700'), theme('colors.violet.100');
    @mixin color-chip-style blue200, theme('colors.blue.200'), theme('colors.blue.300'), theme('colors.blue.700'), theme('colors.blue.100');
    @mixin color-chip-style peacock200, theme('colors.peacock.200'), theme('colors.peacock.300'), theme('colors.peacock.700'), theme('colors.peacock.100');
    @mixin color-chip-style green200, theme('colors.green.200'), theme('colors.green.300'), theme('colors.green.700'), theme('colors.green.100');
    @mixin color-chip-style yellow200, theme('colors.yellow.200'), theme('colors.yellow.300'), theme('colors.yellow.700'), theme('colors.yellow.100');
    @mixin color-chip-style coral200, theme('colors.coral.200'), theme('colors.coral.300'), theme('colors.coral.700'), theme('colors.coral.100');
    @mixin color-chip-style red200, theme('colors.red.200'), theme('colors.red.300'), theme('colors.red.700'), theme('colors.red.100');
}
</style>
