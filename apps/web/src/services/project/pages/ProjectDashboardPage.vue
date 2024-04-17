<script lang="ts" setup>

interface Props {
    id: string;
}
const props = defineProps<Props>();

</script>

<template>
    <div class="project-dashboard-page">
        Project Dashboard Page {{ props.id }}
    </div>
</template>

<style lang="postcss" scoped>
.project-dashboard-page {
    padding: 1rem;
}
</style>
