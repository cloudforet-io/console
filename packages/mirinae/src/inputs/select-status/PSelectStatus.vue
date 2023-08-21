<template>
    <p-status class="p-select-status"
              :class="{selected: isSelected, 'with-icon': withIcon}"
              :icon="icon || (isSelected && !disableCheckIcon ? 'ic_check' : undefined)"
              :icon-size="0.875"
              :icon-color="withIconColor"
              :icon-animation="iconAnimation"
              :disable-icon="!withIcon && (!isSelected || disableCheckIcon)"
              @click="onClick"
    >
        <slot>{{ value }}</slot>
    </p-status>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';

import PStatus from '@/data-display/status/PStatus.vue';
import type { AnimationType } from '@/foundation/icons/config';
import { ANIMATION_TYPE } from '@/foundation/icons/config';
import type { SelectProps } from '@/hooks/select';
import { useSelect } from '@/hooks/select';

/* NOTE: this is not used in the component, but it is used in the story
    interface Props extends SelectProps {
        icon?: string;
        iconColor?: string;
        iconAnimation?: ANIMATION_TYPE;
        disableCheckIcon?: boolean;
    }
 */

const props = defineProps({
    /* select props */
    selected: {
        type: [Boolean, String, Number, Object, Array],
        default: undefined,
    },
    value: {
        type: [Boolean, String, Number, Object, Array],
        default: '',
    },
    predicate: {
        type: Function as PropType<SelectProps['predicate']>,
        default: undefined,
    },
    multiSelectable: {
        type: Boolean,
        default: false,
    },
    /* status props */
    icon: {
        type: String,
        default: undefined,
    },
    iconColor: {
        type: String,
        default: undefined,
    },
    iconAnimation: {
        type: String as PropType<AnimationType>,
        default: undefined,
        validator(animation: string) {
            return animation === undefined || Object.values(ANIMATION_TYPE).includes(animation);
        },
    },
    disableCheckIcon: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['change']);

const {
    isSelected,
    getSelected,
} = useSelect({
    value: computed(() => props.value),
    selected: computed(() => props.selected),
    predicate: computed(() => props.predicate),
    multiSelectable: computed(() => props.multiSelectable),
});
const withIcon = computed(() => props.icon);
const withIconColor = computed(() => {
    if (props.icon) {
        if (props.iconColor) {
            return props.iconColor;
        }
        return undefined;
    }
    return 'inherit';
});

/* event */
const onClick = () => {
    const newSelected = getSelected();
    if (props.multiSelectable) {
        emit('change', newSelected, !isSelected.value);
    } else {
        emit('change', newSelected, true);
    }
};

</script>

<style lang="postcss">
.p-select-status {
    @apply items-center;
    gap: 0.25rem;
    &.p-status {
        @apply text-gray-700;
        cursor: pointer;

        .text {
            margin-left: 0;
            font-size: 0.875rem;
        }

        &.with-icon {
            .text {
                margin-left: 0.25rem;
            }
        }

        &:hover:not(.selected) {
            @apply text-gray-900;
        }

        &.selected {
            @apply text-secondary;
        }
    }
}
</style>
