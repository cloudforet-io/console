<template>
    <p-badge style-type="gray200"
             class="dashboard-date-range-badge"
    >
        {{ MOCK_DATE }}
    </p-badge>
</template>

<script setup lang="ts">
import { PBadge } from '@spaceone/design-system';

const MOCK_DATE = 'UTC December 18 ~ 25, 2022';
</script>
