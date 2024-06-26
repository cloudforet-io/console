<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI, PTooltip } from '@spaceone/design-system';

import { gray, peacock } from '@/styles/colors';

interface AutoSyncStateProps {
    state?: 'ENABLED' | 'DISABLED'
    size?: 'lg' | 'md' | 'sm' | 'xs'
}

const props = withDefaults(defineProps<AutoSyncStateProps>(), {
    state: 'ENABLED',
    size: 'md',
});

const state = reactive({
    isLabelVisible: computed(() => ['lg', 'md'].includes(props.size)),
    iconSize: computed(() => {
        switch (props.size) {
        case 'lg':
            return '1.25rem';
        case 'md':
            return '1.125rem';
        case 'sm':
            return '1.25rem';
        case 'xs':
            return '1.125rem';
        default:
            return '1.25rem';
        }
    }),
});

</script>

<template>
    <p-tooltip :contents="!state.isLabelVisible ? 'Auto Synced' : ''"
               position="bottom"
    >
        <span v-if="!(!state.isLabelVisible && props.state === 'DISABLED')"
              class="auto-sync-state"
              :class="{ [props.size]: true, [props.state]: true}"
        >
            <p-i :width="state.iconSize"
                 :height="state.iconSize"
                 :color="'ENABLED' === props.state ? peacock[800] : gray[700]"
                 name="ic_automation"
            /><span v-if="state.isLabelVisible"
                    class="state"
            >{{ props.state === 'ENABLED' ? 'ON' : 'Off' }}</span>
        </span>
    </p-tooltip>
</template>

<style scoped lang="postcss">
.auto-sync-state {
    @apply bg-peacock-200 text-peacock-800 inline-flex items-center justify-center;
    border-radius: 6.25rem;
}

.DISABLED {
    @apply bg-gray-200 text-gray-700;
}

.lg {
    padding: 0.125rem 0.625rem 0.125rem 0.5rem;
    .state {
        @apply text-label-md;
        margin-left: 0.25rem;
    }
}

.md {
    padding: 0.0625rem 0.375rem 0.0625rem 0.25rem;
    .state {
        @apply text-label-sm;
        margin-left: 0.125rem;
    }
}

.sm {
    padding: 0.125rem;
}

.xs {
    padding: 0.0625rem;
}
</style>
