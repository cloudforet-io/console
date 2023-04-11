<template>
    <span class="p-spinner">
        <svg class="p-spinner-svg"
             :class="[styleType, size]"
             viewBox="0 0 32 32"
             fill="none" xmlns="http://www.w3.org/2000/svg"
        >
            <g>
                <circle class="spinner-bg"
                        cx="16" cy="16" r="14"
                        stroke-opacity="0.3"
                        stroke-width="9%"
                />
                <circle class="spinner"
                        cx="16" cy="16" r="14"
                        stroke-width="9%"
                        stroke-linecap="round" stroke-dasharray="32 200"
                />
            </g>
        </svg>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';

import type { SpinnerSize, SpinnerStyleType } from '@/feedbacks/loading/spinner/type';
import { SPINNER_SIZE, SPINNER_STYLE_TYPE } from '@/feedbacks/loading/spinner/type';

interface Props {
    size?: string;
    styleType?: string;
}

export default defineComponent<Props>({
    name: 'PSpinner',
    components: {
    },
    props: {
        size: {
            type: String as PropType<SpinnerSize>,
            default: SPINNER_SIZE.md,
        },
        styleType: {
            type: String as PropType<SpinnerStyleType>,
            default: SPINNER_STYLE_TYPE.gray,
        },
    },
});
</script>

<style lang="postcss">
.p-spinner {
    .p-spinner-svg {
        --spinner-speed: 2s;
        vertical-align: middle;
        transform-origin: center;
        animation: rotate var(--spinner-speed) 0.3s linear infinite;
        .spinner {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
            stroke-linecap: round;
            animation: stretch calc(var(--spinner-speed) * 0.75) 0.3s ease-in-out infinite;
        }

        @keyframes stretch {
            0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
            }
            50% {
                stroke-dasharray: 90, 200;
                stroke-dashoffset: -2.1875rem;
            }
            100% {
                stroke-dashoffset: -7.75rem;
            }
        }

        @keyframes rotate {
            100% {
                transform: rotate(360deg);
            }
        }

        @define-mixin style-type $bg-color, $spinner-color {
            .spinner-bg {
                stroke: $bg-color;
            }
            .spinner {
                stroke: $spinner-color;
            }
        }

        @define-mixin size $spinner-size {
            width: $spinner-size;
            height: $spinner-size;
        }

        &.gray {
            @mixin style-type #A7A9B2, theme('colors.gray.500');
        }
        &.white {
            @mixin style-type theme('colors.white'), theme('colors.white');
        }
        &.xl {
            @mixin size 2rem;
        }
        &.lg {
            @mixin size 1.5rem;
        }
        &.md {
            @mixin size 1.25rem;
        }
        &.sm {
            @mixin size 1rem;
        }
        &.xs {
            @mixin size 0.75rem;
        }
    }
}

</style>
