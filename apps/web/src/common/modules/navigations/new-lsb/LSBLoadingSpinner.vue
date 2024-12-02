<script setup lang="ts">
import {
    PSpinner,
} from '@cloudforet/mirinae';

const props = defineProps<{
    loading: boolean;
}>();
</script>

<template>
    <div class="relative">
        <div v-show="props.loading"
             class="absolute flex flex-col px-4 w-full"
        >
            <p-spinner size="md" />
        </div>
    </div>
</template>
