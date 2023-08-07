<template>
    <p-button
        class="p-icon-button"
        :class="{ activated, [size]: true, loading, [shape]: true }"
        :style-type="styleType"
        :disabled="disabled || loading"
        v-on="listeners"
    >
        <p-spinner v-if="loading"
                   :size="state.loadingSize"
        />
        <slot v-else>
            <p-i :name="name"
                 :width="state.sizeValue"
                 :height="state.sizeValue"
                 :color="color"
                 :animation="animation"
            />
        </slot>
    </p-button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import {
    computed, reactive, useAttrs,
} from 'vue';

import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';
import type { AnimationType } from '@/foundation/icons/config';
import { ANIMATION_TYPE } from '@/foundation/icons/config';
import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import type { ButtonSize } from '@/inputs/buttons/button/type';
import type {
    IconButtonShape, IconButtonSize, IconButtonStyleType,
} from '@/inputs/buttons/icon-button/type';
import {
    ICON_BUTTON_SHAPE, ICON_BUTTON_SIZE, ICON_BUTTON_STYLE_TYPE,
} from '@/inputs/buttons/icon-button/type';


const LOADING_SIZE: Record<ButtonSize, string> = {
    sm: SPINNER_SIZE.sm,
    md: SPINNER_SIZE.lg,
    lg: SPINNER_SIZE.xl,
};

interface Props {
    name: string;
    styleType: IconButtonStyleType;
    color: string;
    disabled: boolean;
    activated: boolean;
    loading: boolean;
    size: IconButtonSize;
    animation: AnimationType|undefined;
    shape: IconButtonShape;
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    styleType: ICON_BUTTON_STYLE_TYPE.transparent,
    color: 'inherit',
    disabled: false,
    activated: false,
    loading: false,
    size: 'md',
    animation: undefined,
    shape: ICON_BUTTON_SHAPE.circle,
});

const state = reactive({
    sizeValue: computed(() => ICON_BUTTON_SIZE[props.size] || '1.5rem'),
    loadingSize: computed(() => LOADING_SIZE[props.size] ?? LOADING_SIZE.md),
});

const emit = defineEmits(['click']);
const attrs = useAttrs();

const listeners = {
    ...attrs,
    click: (event) => {
        emit('click', event);
    },
};

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
