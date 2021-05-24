<template>
    <p-button
        class="p-icon-button"
        :class="[activated ? 'activated' : '', shape, size]"
        :style-type="styleType"
        :outline="outline"
        :disabled="disabled"
        v-on="$listeners"
    >
        <slot>
            <p-i :name="name"
                 :width="width"
                 :height="height"
                 :color="color"
                 :animation="animation"
            />
        </slot>
    </p-button>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import {
    ICON_BUTTON_SHAPE, ICON_BUTTON_SIZE, ICON_BUTTON_STYLE_TYPE, IconButtonProps,
} from '@/inputs/buttons/icon-button/type';
import { ANIMATION_TYPE } from '@/foundation/icons/config';


export default defineComponent({
    name: 'PIconButton',
    components: { PLottie, PButton, PI },
    props: {
        name: {
            type: String,
            default: '',
        },
        styleType: {
            type: String,
            default: 'transparent',
            validator: value => Object.keys(ICON_BUTTON_STYLE_TYPE).includes(value as string),
        },
        color: {
            type: String,
            default: 'inherit',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        activated: {
            type: Boolean,
            default: false,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: 'md',
            validator: value => Object.keys(ICON_BUTTON_SIZE).includes(value as string),
        },
        shape: {
            type: String,
            default: 'circle',
            validator: value => Object.keys(ICON_BUTTON_SHAPE).includes(value as string),
        },
        animation: {
            type: String,
            default: undefined,
            validator(animation: any) {
                return animation === undefined || Object.values(ANIMATION_TYPE).includes(animation);
            },
        },
    },
    setup(props: IconButtonProps) {
        const state = reactive({
            width: ICON_BUTTON_SIZE[props.size],
            height: ICON_BUTTON_SIZE[props.size],
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-icon-button {
    @apply rounded-sm p-0 inline-flex justify-center items-center;
    min-width: 2rem;
    min-height: 2rem;
    max-width: 2rem;
    max-height: 2rem;

    &.circle {
        border-radius: 50%;
    }
    &.lg {
        min-width: 2.5rem;
        min-height: 2.5rem;
        max-width: 2.5rem;
        max-height: 2.5rem;
    }
    &.sm {
        min-width: 1.5rem;
        min-height: 1.5rem;
        max-width: 1.5rem;
        max-height: 1.5rem;
    }
    &.loading:hover {
        cursor: not-allowed;
        &.transparent {
            @apply bg-transparent;
        }
    }
    &.gray-border {
        @apply border-gray-300;
        &:not(.disabled):not(.loading):not(.activated):hover {
            @apply text-gray-900 border-gray-900;
        }
        &.disabled, &.loading {
            @apply bg-gray-200 text-gray-400 border-white;
            cursor: not-allowed;
        }
        &.activated {
            @apply text-secondary border-secondary;
        }
    }
}
</style>
