<template>
    <p-button
        class="p-icon-button"
        :class="{ activated, [size]: true, loading}"
        :style-type="styleType"
        :outline="outline"
        :disabled="disabled || loading"
        v-on="$listeners"
    >
        <p-lottie v-if="loading" name="thin-spinner" auto
                  :width="sizeValue"
                  :height="sizeValue"
        />
        <slot v-else>
            <p-i :name="name"
                 :width="sizeValue"
                 :height="sizeValue"
                 :color="color"
                 :animation="animation"
            />
        </slot>
    </p-button>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import {
    ICON_BUTTON_SIZE, ICON_BUTTON_STYLE_TYPE, IconButtonProps,
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
        loading: {
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
            sizeValue: computed(() => ICON_BUTTON_SIZE[props.size] || '1.5rem'),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-icon-button {
    @apply rounded-l p-0 inline-flex justify-center items-center;
    min-width: 2rem;
    min-height: 2rem;
    max-width: 2rem;
    max-height: 2rem;
    .p-i-icon {
        flex-shrink: 0;
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

    /* style types */
    &.transparent {
        @apply rounded-full;
        &.loading:hover {
            @apply bg-transparent;
        }
        &.activated {
            @apply text-secondary;
        }
    }
    &.gray-border {
        &:not(.loading):not(.disabled) {
            @apply border-gray-300;
        }
        &:not(.disabled):not(.loading):not(.activated):hover {
            @apply text-gray-900 border-gray-900;
        }
        &.activated {
            @apply text-secondary border-secondary;
        }
    }
}
</style>
