<script setup lang="ts">

import { computed, reactive } from 'vue';

import { useResourceInputDataStore, useResourceTypeInputDataStore } from '@/stores/input-data-store';

import CodeEditor from '@/components/CodeEditor.vue';
import CodeEditorModal from '@/components/CodeEditorModal.vue';
import ViewPanel from '@/components/ViewPanel.vue';


const resourceTypeStore = useResourceTypeInputDataStore();
const resourceStore = useResourceInputDataStore();

type Title = 'Resource Type' | 'Resource';
const state = reactive({
    modalVisible: false,
    modalTitle: 'Resource Type' as Title,
    code: computed<string>(() => (state.modalTitle === 'Resource Type' ? resourceTypeStore.state.code : resourceStore.state.code)),
    codeType: computed<string>(() => (state.modalTitle === 'Resource Type' ? resourceTypeStore.state.codeType : resourceStore.state.codeType)),
});

const handleExpand = (title: string) => {
    state.modalTitle = title;
    state.modalVisible = true;
};

const handleModalConfirm = (code: string, codeType: string, parsedObject: object) => {
    state.modalVisible = false;
    if (state.modalTitle === 'Resource Type') {
        resourceTypeStore.updateCode(code);
        resourceTypeStore.updateCodeType(codeType);
        resourceTypeStore.updateParsedObject(parsedObject);
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
                Resource Type
            </template>
            <template #contents-resource-type>
                <code-editor :code="resourceTypeStore.state.code"
                             :code-type="resourceTypeStore.state.codeType"
                             @update:code="resourceTypeStore.updateCode"
                             @update:code-type="resourceTypeStore.updateCodeType"
                             @update:parsed-object="resourceTypeStore.updateParsedObject"
                             @expand="handleExpand('Resource Type')"
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
