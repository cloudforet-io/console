<template>
    <div class="p-radio-group" :class="direction">
        <slot name="default" />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';

import type { Direction } from '@/inputs/radio-group/type';
import { DIRECTION } from '@/inputs/radio-group/type';

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
            margin-right: 1rem;
        }
    }
    &.vertical {
        @apply flex flex-col row-gap-1;
    }
}
</style>
