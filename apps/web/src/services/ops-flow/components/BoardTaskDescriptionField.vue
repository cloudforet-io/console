<script setup lang="ts">
import { computed } from 'vue';

import { PCollapsiblePanel } from '@cloudforet/mirinae';

import type { FileModel } from '@/api-clients/file-manager/schema/model';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';

const props = defineProps<{
    description?: string;
    files?: FileModel[];
}>();


const { editorContents } = useEditorContentTransformer({
    contents: computed(() => props.description ?? ''),
    contentsType: 'markdown',
    resourceGroup: 'PROJECT',
});
</script>

<template>
    <p-collapsible-panel v-if="props.description"
                         class="task-desc-field"
                         :line-clamp="1"
                         :enable-deep-clamp="true"
    >
        <text-editor-viewer :contents="editorContents"
                            contents-type="markdown"
        />
    </p-collapsible-panel>
</template>

<style scoped lang="postcss">
.task-desc-field {
    padding: 0;
}
</style>
