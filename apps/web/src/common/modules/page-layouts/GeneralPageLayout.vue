<script lang="ts" setup>
import FNB from '@/common/modules/navigations/FNB.vue';
</script>

<template>
    <div class="general-page-layout">
        <portal-target name="page-top-notification" />
        <div class="header">
            <slot name="handbook" />
        </div>

        <div class="page-contents">
            <slot />
        </div>
        <div class="fnb">
            <f-n-b />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.general-page-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: stretch;
    overflow: auto;

    .header {
        @apply flex;
        padding: 1.5rem 1.5rem 0.25rem 1.5rem;
        &.without-breadcrumbs {
            padding: 0;
        }
    }
    .page-contents {
        width: 100%;
        flex-grow: 1;
        padding: 0 1.5rem 2rem 1.5rem;
        max-width: 1920px;

        &.without-breadcrumbs {
            padding: 1.5rem 1.5rem 2rem 1.5rem;
        }
    }
    .fnb {
        width: 100%;
    }
}
</style>
