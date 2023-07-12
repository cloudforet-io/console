<script lang="ts" setup>
import {
    PHeading,
} from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

interface Props {
    description: string;
    totalSteps: number;
    currentStep: number;
}

defineProps<Props>();
const { t } = useI18n();

</script>

<template>
    <div class="dashboard-create-header">
        <p class="step">
            {{ t('DASHBOARDS.CREATE.STEP') }} {{ currentStep }}/{{ totalSteps }}
        </p>
        <p-heading heading-type="main">
            {{ t('DASHBOARDS.CREATE.TITLE') }}
        </p-heading>
        <p class="description">
            {{ description }}
        </p>
    </div>
</template>

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
