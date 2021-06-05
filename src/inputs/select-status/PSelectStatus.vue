<template>
    <p-status class="p-select-status" :class="{selected: isSelected, 'with-icon': withIcon}"
              :icon="icon || (isSelected ? 'ic_check' : undefined)"
              :icon-color="icon ? undefined : 'inherit'"
              :icon-animation="iconAnimation"
              :lottie="lottie"
              :disable-icon="!withIcon && !isSelected"
              @click="onClick"
    >
        {{ value }}
    </p-status>
</template>

<script lang="ts">
import { SelectProps, useSelect } from '@/hooks/select';
import { computed, defineComponent, toRefs } from '@vue/composition-api';
import PStatus from '@/data-display/status/PStatus.vue';
import { ANIMATION_TYPE } from '@/foundation/icons/config';

interface Props extends SelectProps {
    icon?: string;
    lottie?: string;
    iconAnimation?: ANIMATION_TYPE;
}

export default defineComponent({
    name: 'PSelectStatus',
    components: { PStatus },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
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
            type: Function,
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
        lottie: {
            type: String,
            default: undefined,
        },
        iconAnimation: {
            type: String,
            default: undefined,
            validator(animation: any) {
                return animation === undefined || Object.values(ANIMATION_TYPE).includes(animation);
            },
        },
    },
    setup(props: Props, context) {
        const { state, onClick } = useSelect(props, context);
        const withIcon = computed(() => props.icon || props.lottie);
        return {
            ...toRefs(state),
            onClick,
            withIcon,
        };
    },
});
</script>

<style lang="postcss">
.p-select-status {
    &.p-status {
        @apply text-gray-700;
        cursor: pointer;

        .text {
            margin-left: 0;
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
