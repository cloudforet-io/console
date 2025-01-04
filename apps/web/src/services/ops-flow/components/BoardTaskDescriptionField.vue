<script setup lang="ts">
import { computed } from 'vue';

import { PCollapsiblePanel } from '@cloudforet/mirinae';

import type { FileModel } from '@/schema/file-manager/model';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';

const props = defineProps<{
    description?: string;
    files?: FileModel[];
}>();


const { editorContents } = useEditorContentTransformer({
    contents: computed(() => props.description ?? ''),
    contentType: 'markdown',
    resourceGroup: 'PROJECT',
});
</script>

<template>
    <p-collapsible-panel v-if="props.description"
                         class="task-desc-field"
                         :line-clamp="1"
    >
        <text-editor-viewer :contents="editorContents"
                            content-type="markdown"
        />
    </p-collapsible-panel>
</template>

<style scoped lang="postcss">
.task-desc-field {
    padding: 0;
}
</style>
