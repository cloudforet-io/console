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
    container-name: p-heading-layout;
    container-type: inline-size;
    width: 100%;
    >.layout-container {
        display: flex;
        width: 100%;
        gap: 0.5rem;
        > .heading-container {
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
        }
    }

    @container p-heading-layout (max-width: theme('screens.mobile.max')) {
        .layout-container {
            flex-direction: column;
            > .heading-container {
                width: 100%;
            }
            > .extra-container {
                width: 100%;
            }
        }
    }
}

</style>
