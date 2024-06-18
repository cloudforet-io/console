<script setup lang="ts">
import { PHeading, PButton } from '@spaceone/design-system';
</script>

<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG_TITLE')">
            <template #extra>
                <p-button icon-left="ic_plus">
                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CREATE') }}
                </p-button>
            </template>
        </p-heading>
    </div>
</template>
