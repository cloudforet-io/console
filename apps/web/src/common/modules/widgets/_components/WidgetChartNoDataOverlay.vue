<script setup lang="ts">
import { PEmpty } from '@spaceone/design-system';
</script>

<template>
    <div class="widget-chart-no-data-overlay">
        <p-empty>
            {{ $t('DASHBOARDS.WIDGET.NO_DATA') }}
        </p-empty>
    </div>
</template>

<style scoped lang="postcss">
.widget-chart-no-data-overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    background: rgba(theme('colors.white'), 0.4);
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
