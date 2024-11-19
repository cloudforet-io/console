<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

import PTextInput from '@/controls/input/text-input/PTextInput.vue';
import { useProxyValue } from '@/hooks';


const sliderRef = ref<HTMLElement|null>(null);
interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    value: number|string;
    showInput?: boolean;
    showValue?: boolean;
}
const props = withDefaults(defineProps<SliderProps>(), {
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    showValue: true,
});
const emit = defineEmits<{(event: 'update:value', value: boolean): void;
}>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
});

const setCSSProgress = (val: number) => {
    const _rangeValue = props.max - props.min;
    const _valuePosition = val - props.min;
    const _percentage = (_valuePosition / _rangeValue) * 100;
    sliderRef.value?.style.setProperty('--ProgressPercent', `${_percentage}%`);
};

watch([() => state.proxyValue, () => sliderRef.value], ([val, _sliderRef]) => {
    if (!_sliderRef) return;
    setCSSProgress(val);
}, { immediate: true });
</script>

<template>
    <div class="p-slider">
        <div class="slider-wrapper">
            <input ref="sliderRef"
                   v-model="state.proxyValue"
                   type="range"
                   :step="props.step"
                   :min="props.min"
                   :max="props.max"
                   class="custom-slider"
            >
            <span v-if="showValue"
                  class="bottom-text min"
            >{{ props.min }}</span>
            <span v-if="showValue"
                  class="bottom-text max"
            >{{ props.max }}</span>
        </div>
        <p-text-input v-if="props.showInput"
                      v-model="state.proxyValue"
                      type="number"
                      :min="props.min"
                      :max="props.max"
                      class="value-text-input"
        />
    </div>
</template>

<style lang="postcss">
.p-slider {
    display: flex;
    gap: 0.5rem;

    .slider-wrapper {
        position: relative;
        display: inline-block;
        width: 100%;
        .custom-slider {
            width: 100%;

            --trackHeight: 0.25rem;
        }
        .bottom-text {
            @apply text-label-md;
            position: absolute;
            top: 1rem;
            &.min {
                left: 0;
            }
            &.max {
                right: 0;
            }
        }
    }

    /* style the input element with type "range" */
    input[type="range"] {
        position: relative;
        appearance: none;
        border-radius: 999px;
        z-index: 0;
    }

    /* ::before element to replace the slider track */
    input[type="range"]::before {
        @apply bg-blue-600;
        content: "";
        position: absolute;
        transform: translate(0, -50%);
        width: var(--ProgressPercent, 100%);
        height: 0.25rem;
        top: 50%;
        pointer-events: none;
        border-radius: 999px;
    }

    /* `::-webkit-slider-runnable-track` targets the track (background) of a range slider in chrome and safari browsers. */
    input[type="range"]::-webkit-slider-runnable-track {
        @apply bg-gray-150;
        appearance: none;
        height: var(--trackHeight);
        border-radius: 999px;
    }

    input[type="range"]::-webkit-slider-thumb {
        @apply bg-white border-2 border-solid border-blue-600;
        position: relative;
        top: 50%;
        transform: translate(0, -50%);
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 999px;
        cursor: pointer;
        pointer-events: all;
        appearance: none;
        z-index: 1;
    }

    .value-text-input {
        width: 4rem;
        > .input-container input {
            width: 100%;
        }
    }
}
</style>
