<script setup lang="ts">

interface Props {
    to: {
        name: string;
    } | null;
}

const props = withDefaults(defineProps<Props>(), {
    to: null,
});

</script>

<template>
    <div class="gnb-admin-logo">
        <component :is="props.to ? 'router-link' : 'div'"
                   class="inline-block"
                   :to="props.to"
        >
            <span class="admin-title">
                Admin
            </span>
        </component>
    </div>
</template>

<style scoped lang="postcss">
.gnb-admin-logo {
    @apply inline-flex w-full h-full items-center;
    max-width: 16.25rem;
    width: 16.25rem;
    padding: 0.625rem 1rem 0.625rem 1.25rem;
    box-shadow: 0.1875rem 0 0.25rem 0 rgba(255, 255, 255, 0.3);

    .admin-title {
        @apply text-label-xl text-violet-100;
    }
}
</style>
