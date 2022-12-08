<template>
    <div class="dashboard-control-buttons">
        <!--        song-lang-->
        <p-button icon-left="ic_decorate"
                  style-type="tertiary"
                  @click="$router.push({ name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME })"
        >
            Customize
        </p-button>
        <!--        song-lang-->
        <p-button icon-left="ic_download"
                  style-type="tertiary"
        >
            Export
        </p-button>
        <!--        song-lang-->
        <p-button icon-left="ic_duplicate"
                  style-type="tertiary"
        >
            Clone
        </p-button>
    </div>
</template>

<script setup lang="ts">
import { PButton } from '@spaceone/design-system';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
</script>

<style lang="postcss">
.dashboard-control-buttons {
    display: flex;
    gap: 0.75rem;
}
</style>
