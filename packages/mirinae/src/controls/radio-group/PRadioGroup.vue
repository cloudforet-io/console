<template>
    <div class="p-radio-group"
         :class="direction"
    >
        <slot name="default" />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';

import type { Direction } from '@/controls/radio-group/type';
import { DIRECTION } from '@/controls/radio-group/type';

interface RadioGroupProps {
    direction?: Direction;
}
export default defineComponent<RadioGroupProps>({
    name: 'PRadioGroup',
    components: { },
    props: {
        direction: {
            type: String as PropType<Direction>,
            default: DIRECTION.horizontal,
            validator(value: Direction) {
                return Object.values(DIRECTION).includes(value);
            },
        },
    },
});
</script>

<style lang="postcss">
.p-radio-group {
    &.horizontal {
        .p-radio {
            @apply inline-block;
            margin-right: 0.5rem;
        }
    }
    &.vertical {
        @apply flex flex-col;
        gap: 0.5rem;
    }
}
</style>
