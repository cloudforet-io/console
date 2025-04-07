<template>
    <p-button
        class="p-icon-button"
        :class="{ activated, [size]: true, loading, [shape]: true }"
        :style-type="styleType"
        :disabled="disabled || loading"
        :active="activated"
        v-on="$listeners"
    >
        <p-spinner v-if="loading"
                   :size="loadingSize"
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
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PButton from '@/controls/buttons/button/PButton.vue';
import type { ButtonSize } from '@/controls/buttons/button/type';
import { BUTTON_STYLE } from '@/controls/buttons/button/type';
import type {
    IconButtonShape, IconButtonSize, IconButtonStyleType,
} from '@/controls/buttons/icon-button/type';
import {
    ICON_BUTTON_SHAPE, ICON_BUTTON_SIZE,
} from '@/controls/buttons/icon-button/type';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import type { SpinnerSize } from '@/feedbacks/loading/spinner/type';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';
import type { AnimationType } from '@/foundation/icons/config';
import PI from '@/foundation/icons/PI.vue';


const LOADING_SIZE: Record<ButtonSize, SpinnerSize> = {
    sm: SPINNER_SIZE.sm,
    md: SPINNER_SIZE.lg,
    lg: SPINNER_SIZE.xl,
};
export default defineComponent({
    name: 'PIconButton',
    components: { PSpinner, PButton, PI },
    props: {
        name: {
            type: String,
            default: '',
        },
        styleType: {
            type: String as PropType<IconButtonStyleType>,
            default: BUTTON_STYLE.transparent,
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
        size: {
            type: String as PropType<IconButtonSize>,
            default: 'md',
        },
        animation: {
            type: String as PropType<AnimationType|undefined>,
            default: undefined,
        },
        shape: {
            type: String as PropType<IconButtonShape>,
            default: ICON_BUTTON_SHAPE.circle,
        },
    },
    setup(props) {
        const state = reactive({
            sizeValue: computed(() => ICON_BUTTON_SIZE[props.size] || '1.5rem'),
            loadingSize: computed(() => LOADING_SIZE[props.size] ?? LOADING_SIZE.md),
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
    > .p-spinner {
        flex-shrink: 0;
    }
    > .p-i-icon {
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

    &.loading {
        > .p-spinner {
            margin-right: 0;
        }
    }

    &.circle {
        @apply rounded-full;
    }

    &.disabled {
        @apply border-transparent;
        &:hover, &:active, &:focus {
            @apply border-transparent;
        }
    }

    /* style types */
    &.transparent {
        &.activated {
            @apply text-blue-600;
        }
        &.disabled {
            @apply bg-transparent;
            &:hover, &:active, &:focus {
                @apply bg-transparent;
            }
        }
    }
    &.negative-transparent {
        &.disabled {
            @apply bg-transparent;
            &:hover, &:active, &:focus {
                @apply bg-transparent;
            }
        }
    }
}
</style>
