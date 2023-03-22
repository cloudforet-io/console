<template>
    <div class="dashboard-create-header">
        <p class="step">
            {{ $t('DASHBOARDS.CREATE.STEP') }} {{ props.currentStep }}/{{ props.totalSteps }}
        </p>
        <h2 class="heading">
            {{ $t('DASHBOARDS.CREATE.TITLE') }}
        </h2>
        <p class="description">
            {{ props.description }}
        </p>
    </div>
</template>

<script lang="ts" setup>
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
    .heading {
        @apply mb-1 text-display-md text-gray-900 font-black;
    }
    .description {
        @apply mt-1 text-label-md text-gray-700;
    }
}
</style>
