<template>
    <span class="beta-mark">beta</span>
</template>

<script lang="ts">
export default {
    name: 'BetaMark',
};
</script>

<style lang="postcss">
.beta-mark {
    @apply text-coral;
    font-size: 0.75rem;
    vertical-align: text-top;
    cursor: default;
    margin-left: 0.25rem;
}
</style>
