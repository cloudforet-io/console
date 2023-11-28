<script setup lang="ts">

import { computed, reactive } from 'vue';

import { useResourceInputDataStore, useMetadataSchemaInputDataStore } from '@/stores/input-data-store';

import CodeEditor from '@/components/CodeEditor.vue';
import CodeEditorModal from '@/components/CodeEditorModal.vue';
import ViewPanel from '@/components/ViewPanel.vue';


const metadataSchemaStore = useMetadataSchemaInputDataStore();
const resourceStore = useResourceInputDataStore();

type Title = 'Metadata Schema' | 'Resource';
const state = reactive({
    modalVisible: false,
    modalTitle: 'Metadata Schema' as Title,
    code: computed<string>(() => (state.modalTitle === 'Metadata Schema' ? metadataSchemaStore.state.code : resourceStore.state.code)),
    codeType: computed<string>(() => (state.modalTitle === 'Metadata Schema' ? metadataSchemaStore.state.codeType : resourceStore.state.codeType)),
});

const handleExpand = (title: string) => {
    state.modalTitle = title;
    state.modalVisible = true;
};

const handleModalConfirm = (code: string, codeType: string, parsedObject: object) => {
    state.modalVisible = false;
    if (state.modalTitle === 'Metadata Schema') {
        metadataSchemaStore.updateCode(code);
        metadataSchemaStore.updateCodeType(codeType);
        metadataSchemaStore.updateParsedObject(parsedObject);
    } else {
        resourceStore.updateCode(code);
        resourceStore.updateCodeType(codeType);
        resourceStore.updateParsedObject(parsedObject);
    }
};
</script>

<template>
    <div>
        <view-panel>
            <template #title-resource-type>
                Metadata Schema
            </template>
            <template #contents-resource-type>
                <code-editor :code="metadataSchemaStore.state.code"
                             :code-type="metadataSchemaStore.state.codeType"
                             @update:code="metadataSchemaStore.updateCode"
                             @update:code-type="metadataSchemaStore.updateCodeType"
                             @update:parsed-object="metadataSchemaStore.updateParsedObject"
                             @expand="handleExpand('Metadata Schema')"
                />
            </template>
            <template #title-resource>
                Resource
            </template>
            <template #contents-resource>
                <code-editor :code="resourceStore.state.code"
                             :code-type="resourceStore.state.codeType"
                             @update:code="resourceStore.updateCode"
                             @update:code-type="resourceStore.updateCodeType"
                             @update:parsed-object="resourceStore.updateParsedObject"
                             @expand="handleExpand('Resource')"
                />
            </template>
        </view-panel>
        <code-editor-modal :visible="state.modalVisible"
                           :title="state.modalTitle"
                           :code="state.code"
                           :code-type="state.codeType"
                           @close="state.modalVisible = false"
                           @confirm="handleModalConfirm"
        />
    </div>
</template>
