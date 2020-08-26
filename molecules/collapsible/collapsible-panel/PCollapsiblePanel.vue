<template>
    <details open>
        <summary @click="changeSummary">
            {{ summary }}
        </summary>
        <p-pane-layout class="help-panel">
            <slot name="content" />
        </p-pane-layout>
    </details>
</template>

<script>
import { ref } from '@vue/composition-api';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';

export default {
    name: 'PCollapsiblePanel',
    components: { PPaneLayout },
    setup() {
        const summary = ref('hide');
        const changeSummary = () => {
            if (summary.value === 'hide') summary.value = 'See more';
            else if (summary.value === 'See more') summary.value = 'hide';
        };
        return {
            summary,
            changeSummary,
        };
    },
};
</script>

<style lang="postcss" scoped>
    details {
        position: relative;
        width: 100%;
        margin-top: -1.5rem;
        margin-bottom: 1.5rem;
    }
    details[open] {
        position: relative;
        height: auto;
        margin-top: inherit;
    }
    details span {
        position: absolute;
        top: 0;
    }
    summary {
        cursor: pointer;
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        z-index: 1;
        font-size: 0.75rem;
    }
    summary:hover {
        @apply text-secondary;
    }
    details[open] ::-webkit-details-marker {
        transform: rotate(180deg);
    }
    .help-panel {
        @apply bg-primary4 border border-gray-200;
        border-left-width: 4px;
        border-radius: 2px 0 0 2px;
    }
</style>
