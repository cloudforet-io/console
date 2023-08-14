<script lang="ts" setup>
</script>

<template>
    <div class="balloon">
        <span class="balloon-text">new</span>
    </div>
</template>

<style lang="postcss" scoped>
.balloon {
    @apply rounded-md;
    position: absolute;
    width: 40px;
    height: 26px;
    background: linear-gradient(90deg, rgba(102, 56, 182, 80%) 0%, rgba(0, 128, 251, 80%) 100%);
    top: 100%;
    left: -0.5rem;
}
.balloon::after {
    border-top: 0 solid transparent;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid #6372d6;
    background: linear-gradient(90deg, rgba(102, 56, 182, 80%) 0%, rgba(0, 128, 251, 80%) 100%);
    content: "";
    position: absolute;
    top: -0.5rem;
    left: 0.95rem;
}
.balloon-text {
    @apply text-white;
    position: absolute;
    top: 0.25rem;
    left: 0.5rem;
    font-size: 0.75rem;
    line-height: 150%;
}
</style>
