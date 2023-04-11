<template>
    <div class="progress-bar"
         :class="size"
    >
        <label v-if="label || $scopedSlots.label" class="label">
            <slot name="label">
                {{ label }}
            </slot>
        </label>
        <div ref="backgroundBar" class="background-bar" />
        <transition appear @before-appear="beforeEnter"
                    @after-appear="enter"
        >
            <div ref="progressBar" class="tracker-bar" :style="progressBarStyle" />
        </transition>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import { PROGRESS_BAR_SIZE } from '@/data-display/progress-bar/config';
import type { ProgressBarProps } from '@/data-display/progress-bar/type';


export default defineComponent<ProgressBarProps>({
    name: 'PProgressBar',
    props: {
        percentage: {
            type: Number,
            default: 0,
        },
        label: {
            type: String,
            default: undefined,
        },
        color: {
            type: String,
            default: undefined,
        },
        gradient: {
            type: Object,
            default: undefined,
        },
        size: {
            type: String,
            default: PROGRESS_BAR_SIZE.md,
            validator(size: any) {
                return Object.values(PROGRESS_BAR_SIZE).includes(size);
            },
        },
        disableAnimation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const linearGradientProperty = `linear-gradient(90deg, ${props.gradient?.startColor} ${props.gradient?.gradientPoint}%, ${props.gradient?.endColor} 100%)`;
        const defaultTrackerBarColor = 'rgba(theme(\'colors.primary\'))';

        const state = reactive({
            progressBar: null as HTMLElement | null,
            progressBarStyle: computed(() => ({
                background: props.gradient ? linearGradientProperty
                    : (props.color ?? defaultTrackerBarColor),
                transition: props.disableAnimation ? undefined : 'width 0.5s linear',
            })),
        });

        const beforeEnter = (element) => {
            element.style.width = props.disableAnimation ? `${props.percentage}%` : 0;
        };

        const enter = (element) => {
            element.style.width = `${props.percentage}%`;
            element.style.transition = 'width 1s linear';
        };

        watch(() => props.percentage, (after, before) => {
            if (after !== before) {
                enter(state.progressBar);
            }
        });

        return {
            ...toRefs(state),
            beforeEnter,
            enter,
        };
    },
});
</script>

<style lang="postcss">
.progress-bar {
    width: 100%;

    .label {
        @apply text-gray-900;
        display: block;
        font-size: 0.875rem;
        font-weight: bolder;
        line-height: 1.4;
        padding-bottom: 0.125rem;
    }

    .background-bar {
        @apply bg-gray-100;
        width: 100%;
        overflow: hidden;
    }

    .tracker-bar {
        @apply bg-primary;
        width: 0;
        max-width: 100%;
        overflow: hidden;
    }

    @define-mixin progress-bar-size $height, $border-radius {
        .background-bar,
        .tracker-bar {
            height: $height;
            border-radius: $border-radius;
        }
        .tracker-bar {
            margin-top: -$height;
        }
    }

    &.sm {
        @mixin progress-bar-size 0.25rem, theme('borderRadius.2xs');
    }
    &.md {
        @mixin progress-bar-size 0.375rem, theme('borderRadius.xs');
    }
    &.lg {
        @mixin progress-bar-size 0.75rem, theme('borderRadius.sm');
    }
}
</style>
