<script setup lang="ts">
import { PHeading } from '@spaceone/design-system';
</script>

<template>
    <div class="admin-data-source-page">
        <p-heading :title="$t('MENU.COST_EXPLORER_DATA_SOURCES')"
                   use-total-count
                   use-selected-count
                   :total-count="2"
                   :selected-count="1"
                   @click-back-button="$router.go(-1)"
        />
    </div>
</template>
