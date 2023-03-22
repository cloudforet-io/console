<template>
    <div class="dashboard-create-header">
        <p class="step">
            {{ $t('DASHBOARDS.CREATE.STEP') }} {{ props.currentStep }}/{{ props.totalSteps }}
        </p>
        <p-heading heading-type="main">
            {{ $t('DASHBOARDS.CREATE.TITLE') }}
        </p-heading>
        <p class="description">
            {{ props.description }}
        </p>
    </div>
</template>

<script lang="ts" setup>
import {
    PHeading,
} from '@spaceone/design-system';

interface Props {
    description: string;
    totalSteps: number;
    currentStep: number;
}

const props = defineProps<Props>();

</script>

<style scoped>
.dashboard-create-header {
    .step {
        @apply mb-1 text-label-sm text-gray-500;
    }
    .p-heading {
        @apply mb-0;
    }
    .description {
        @apply mt-1 text-label-md text-gray-700;
    }
}
</style>
