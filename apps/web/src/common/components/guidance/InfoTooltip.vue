<script setup lang="ts">
import { PTooltip, PI } from '@cloudforet/mirinae';

const props = withDefaults(defineProps<{
    contents: string;
    size: 'sm'|'md';
}>(), {
    contents: '',
    size: 'md',
});
</script>

<template>
    <div class="inline">
        <p-tooltip :contents="props.contents"
                   class="inline-flex"
                   position="bottom"
        >
            <p-i :width="props.size === 'sm' ? '0.75rem' : '1rem'"
                 :height="props.size === 'sm' ? '0.75rem' : '1rem'"
                 name="ic_info-circle"
            />
        </p-tooltip>
    </div>
</template>
