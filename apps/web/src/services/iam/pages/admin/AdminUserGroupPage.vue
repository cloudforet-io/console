<script lang="ts" setup>
</script>

<template>
    <section class="user-group-page">
        유저 그룹 페이지입니다.
    </section>
</template>

<style lang="postcss" scoped>
.user-group-page {
    @apply mx-0;
    max-width: 100%;
}

/* custom design-system component - p-horizontal-layout */
:deep(.user-group-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
