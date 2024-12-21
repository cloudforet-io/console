<script setup lang="ts">
import { onMounted, ref } from 'vue';

const changedMarkRef = ref<HTMLElement|null>(null);
onMounted(() => {
    console.log('ChangedMark component is mounted');
    const changedMark = changedMarkRef.value as HTMLElement;

    const parent = changedMark.parentElement as HTMLElement;
    if (parent) {
        parent.style.position = 'relative';
    }
});
</script>

<template>
    <span ref="changedMarkRef"
          class="bg-secondary1 rounded-xl border-white border-2 absolute w-3 h-3 right-[-0.25rem] top-[-0.25rem]"
    />
</template>
