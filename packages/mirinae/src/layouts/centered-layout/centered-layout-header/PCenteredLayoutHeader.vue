<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

import PHeading from '@/data-display/heading/PHeading.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

const props = defineProps<{
    title?: string;
    description?: string;
    showStep?: boolean;
    currentStep?: number;
    totalSteps?: number;
    showCloseButton?: boolean;
}>();

const emit = defineEmits<{(e: 'close'): void;
}>();

const visibleStep = computed(() => {
    if (!props.showStep) return false;
    if (props.showStep && typeof props.currentStep === 'number' && typeof props.totalSteps === 'number') {
        return true;
    }
    console.error('[Centered Layout Header] when showStep is true, currentStep and totalSteps must be number');
    return false;
});

const handleClickCloseButton = () => {
    emit('close');
};
</script>

<template>
    <div class="p-centered-layout-header">
        <p v-if="visibleStep"
           class="step"
        >
            Step {{ props.currentStep }}<span>/{{ props.totalSteps }}</span>
        </p>
        <p-heading v-if="props.title"
                   :title="props.title"
        >
            <template #extra>
                <p-icon-button v-if="props.showCloseButton"
                               name="ic_close"
                               size="md"
                               color="inherit"
                               class="close-button"
                               @click="handleClickCloseButton"
                />
            </template>
        </p-heading>
        <p v-if="props.description"
           class="description"
        >
            {{ props.description }}
        </p>
    </div>
</template>

<style lang="postcss">
.p-centered-layout-header {
    margin-bottom: 2rem;
    > .step {
        @apply text-label-sm text-gray-900;
        span {
            @apply text-gray-500;
        }
    }
    > .p-heading {
        margin-bottom: 0.3125rem;
    }
    > .description {
        @apply text-label-md text-gray-700;
    }
    > .close-button {
        height: 2rem;
    }
}
</style>
