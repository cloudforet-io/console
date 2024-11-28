<script setup lang="ts">
import { PHeading, PHeadingLayout } from '@cloudforet/mirinae';
</script>

<template>
    <div class="service-page">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="$t('MENU.ALERT_MANAGER_SERVICE')" />
            </template>
        </p-heading-layout>
    </div>
</template>
