<script setup lang="ts">
</script>

<template>
    <div class="p-heading-layout">
        <div class="layout-container">
            <div class="heading-container">
                <slot name="heading" />
            </div>
            <div class="extra-container">
                <slot name="extra" />
            </div>
        </div>
    </div>
</template>

<style lang="postcss">
.p-heading-layout {
    width: 100%;
    >.layout-container {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 0.5rem;
        > .heading-container {
            min-width: 360px;
            flex-grow: 1;
        }
        > .extra-container {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            flex-wrap: wrap;
            flex-shrink: 0;
            float: right;
            margin-top: auto;
            margin-left: auto;
        }
    }
}

</style>
