<script lang="ts" setup>
</script>

<template>
    <span class="new-mark">new</span>
</template>

<style lang="postcss">
.new-mark {
    font-size: 0.75rem;
    background: linear-gradient(to right, theme('colors.primary'), theme('colors.secondary'));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    vertical-align: text-top;
    cursor: default;
    margin-left: 0.25rem;
}
</style>
