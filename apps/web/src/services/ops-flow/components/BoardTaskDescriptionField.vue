<script setup lang="ts">
import { computed } from 'vue';

import { PCollapsiblePanel } from '@cloudforet/mirinae';

import type { FileModel } from '@/schema/file-manager/model';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';

const props = defineProps<{
    description?: string;
    files?: FileModel[];
}>();

const attachments = computed(() => props.files?.map((d) => ({ fileId: d.file_id, downloadUrl: d.download_url })));

</script>

<template>
    <p-collapsible-panel v-if="props.description"
                         class="task-desc-field"
                         :line-clamp="1"
    >
        <text-editor-viewer :contents="props.description"
                            :attachments="attachments"
        />
    </p-collapsible-panel>
</template>

<style scoped lang="postcss">
.task-desc-field {
    padding: 0;
}
</style>
