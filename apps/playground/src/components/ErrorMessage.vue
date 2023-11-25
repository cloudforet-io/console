<script setup lang="ts">
const props = defineProps<{
    error?: Error;
}>();
</script>

<template>
    <p v-if="props.error"
       class="error-message"
    >
        {{ props.error.message }}
    </p>
</template>

<style scoped lang="postcss">
.error-message {
    @apply text-red text-paragraph-sm;
}
</style>
