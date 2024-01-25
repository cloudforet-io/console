<script lang="ts" setup>
import {
    PPaneLayout,
} from '@spaceone/design-system';

</script>

<template>
    <p-pane-layout class="cost-report-overview-card-template">
        <div class="top-part">
            <span class="title">
                <slot name="title" />
            </span>
            <div class="right-extra">
                <slot name="right-extra" />
            </div>
        </div>
        <div class="content-wrapper">
            <slot name="content" />
        </div>
    </p-pane-layout>
</template>

<style lang="scss" scoped>
.cost-report-overview-card-template {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    .top-part {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
            @apply text-label-lg font-bold;
        }
    }
    .content-wrapper {
        padding-top: 1rem;
    }
}
</style>
