<script setup lang="ts">
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';

interface Props {
    readonly: any;
    value?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:value', value: string): void;
}>();

const handleUpdateData = (code: string) => {
    emit('update:value', code);
};

</script>

<template>
    <div>
        <p-text-editor :code="props.value"
                       disable-auto-reformat
                       :read-only="props.readonly"
                       @update:code="handleUpdateData"
        />
    </div>
</template>
