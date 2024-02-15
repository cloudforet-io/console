<script setup lang="ts">
import Toolbox from '@/common/modules/navigations/gnb/Toolbox.vue';
</script>

<template>
    <div class="layout-container">
        <div class="gnb">
            <toolbox />
        </div>
        <main class="main">
            <slot name="main" />
        </main>
    </div>
</template>

<style scoped lang="postcss">
.gnb {
    @apply absolute;
    width: 100%;
    height: 100%;
}
.main {
    @apply absolute;
    top: $gnb-toolbox-height;
}
</style>
