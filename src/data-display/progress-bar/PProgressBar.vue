<template>
    <div class="progress-bar">
        <label v-if="label" class="label">{{ label }}</label>
        <div ref="backgroundBar" class="background-bar" />
        <transition appear @before-appear="beforeEnter" @after-appear="enter">
            <div ref="progressBar" class="tracker-bar" :style="progressBarStyle" />
        </transition>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { ProgressBarProps } from '@/data-display/progress-bar/type';


export default {
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
    },
    setup(props: ProgressBarProps) {
        const linearGradientProperty = `linear-gradient(90deg, ${props.gradient?.startColor} ${props.gradient?.gradientPoint}%, ${props.gradient?.endColor} 100%)`;
        const defaultTrackerBarColor = 'rgba(theme(\'colors.primary\'))';

        const state = reactive({
            progressBar: null as HTMLElement | null,
            progressBarStyle: computed(() => ({
                background: props.gradient ? linearGradientProperty
                    : (props.color ?? defaultTrackerBarColor),
            })),
        });

        const beforeEnter = (element) => {
            element.style.width = 0;
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
};
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
        @apply bg-gray-100 rounded-sm;
        width: 100%;
        overflow: hidden;
        height: 0.375rem;
    }

    .tracker-bar {
        @apply bg-primary rounded-sm;
        width: 0;
        overflow: hidden;
        transition: width 0.5s linear;
        height: 0.375rem;
        margin-top: -0.375rem;
    }
}
</style>
