<script lang="ts" setup>
import { gray } from '@/styles/colors';

interface Props {
    value?: string;
}
const props = withDefaults(defineProps<Props>(), {
    value: gray[200],
});
const emit = defineEmits<{(e: 'update:value', value): void;
}>();

/* Event */
const handleChangeInput = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    emit('update:value', target.value);
};
</script>

<template>
    <input :value="props.value"
           type="color"
           class="color-input"
           @change="handleChangeInput"
    >
</template>

<style lang="postcss" scoped>
.color-input {
    @apply rounded-sm border border-gray-200 bg-white;
    width: 2rem;
    height: 2rem;
    padding: 0 0.125rem;
}
</style>
