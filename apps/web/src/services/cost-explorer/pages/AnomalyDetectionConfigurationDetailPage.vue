<script setup lang="ts">
import { PHeading, PIconButton } from '@spaceone/design-system';

import AnomalyDetectionConfigurationInformation
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformation.vue';
import AnomalyDetectionConfigurationTrend
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationTrend.vue';
</script>

<template>
    <div class="anomaly-detection-configuration-detail-page">
        <p-heading title="detail page"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        >
            <template #title-right-extra>
                <div class="toolbox-button-wrapper">
                    <p-icon-button name="ic_edit-text" />
                    <p-icon-button name="ic_delete" />
                </div>
            </template>
        </p-heading>
        <anomaly-detection-configuration-trend class="form" />
        <anomaly-detection-configuration-information class="form" />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-detail-page {
    .toolbox-button-wrapper {
        @apply flex items-center;
    }
    .form + .form {
        margin-top: 1rem;
    }
}
</style>
