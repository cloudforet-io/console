<script setup lang="ts">

import { computed, reactive, useSlots } from 'vue';

import { PFieldTitle, PPaneLayout } from '@spaceone/design-system';

const slots = useSlots();

const state = reactive({
    keys: computed<string[]>(() => Object.keys(slots)
        .filter((slotName) => slotName.startsWith('title-'))
        .map((slotName) => slotName.replace('title-', ''))),
});
</script>

<template>
    <div class="view-panel">
        <div v-for="(key) in state.keys"
             :key="key"
             class="code-view-wrapper"
        >
            <p-field-title>
                <slot :name="`title-${key}`" />
            </p-field-title>
            <p-pane-layout class="contents-wrapper">
                <slot :name="`contents-${key}`" />
            </p-pane-layout>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.view-panel {
    display: flex;
    gap: 1rem;
    overflow: hidden;
    .p-field-title {
        margin-left: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .code-view-wrapper {
        width: calc(50% - 0.5rem);
    }
    .contents-wrapper {
        padding: 1rem;
    }

    @screen tablet {
        flex-direction: column;
        .code-view-wrapper {
            width: 100%;
        }
    }
}
</style>
