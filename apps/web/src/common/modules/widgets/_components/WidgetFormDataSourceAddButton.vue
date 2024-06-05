<script lang="ts" setup>
import { PIconButton } from '@spaceone/design-system';


const emit = defineEmits<{(e: 'click-add'): void;
}>();
</script>

<template>
    <p-icon-button name="ic_plus"
                   class="widget-form-data-source-add-button"
                   size="lg"
                   shape="square"
                   @click="emit('click-add')"
    />
</template>

<style lang="postcss" scoped>
.widget-form-data-source-add-button {
    @apply bg-violet-400 border border-violet-500 text-white;
    &:hover, &:active, &:focus {
        @apply bg-violet-500;
    }
}
</style>
