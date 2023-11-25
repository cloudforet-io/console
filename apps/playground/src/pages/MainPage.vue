<script setup lang="ts">
import { reactive } from 'vue';

import {
    PPaneLayout, PHeading, PDynamicLayout,
} from '@spaceone/design-system';

import CodeEditor from '@/components/CodeEditor.vue';
import CodeEditorModal from '@/components/CodeEditorModal.vue';

const state = reactive({
    schema: null as null|object,
    data: null as null|object,
    modalVisible: false,
    modalTitle: '',
    schemaCode: '',
    schemaCodeType: 'Json' as string,
    dataCode: '',
    dataCodeType: 'Json' as string,
});

const handleUpdateSchema = (schema: object) => {
    state.schema = schema;
};
const handleUpdateData = (data: object) => {
    state.data = data;
};
const handleExpand = (title: string) => {
    state.modalTitle = title;
    state.modalVisible = true;
};
const handleModalConfirm = (code: string, codeType: string, parsedObject: object) => {
    state.modalVisible = false;
    if (state.modalTitle === 'Schema') {
        state.schemaCode = code;
        state.schemaCodeType = codeType;
        state.schema = parsedObject;
    } else {
        state.dataCode = code;
        state.dataCodeType = codeType;
        state.data = parsedObject;
    }
};
</script>

<template>
    <div class="main-page">
        <p-heading>Playground</p-heading>
        <div class="page-contents">
            <section class="input-sections-wrapper">
                <div class="input-section">
                    <p-heading heading-type="sub">
                        Schema
                    </p-heading>
                    <p-pane-layout class="edit-wrapper">
                        <code-editor :code="state.schemaCode"
                                     :code-type="state.schemaCodeType"
                                     @update:code="state.schemaCode = $event"
                                     @update:code-type="state.schemaCodeType = $event"
                                     @update:parsed-object="handleUpdateSchema"
                                     @expand="handleExpand('Schema')"
                        />
                    </p-pane-layout>
                </div>
                <div class="input-section">
                    <p-heading heading-type="sub">
                        Data
                    </p-heading>
                    <p-pane-layout class="edit-wrapper">
                        <code-editor :code="state.dataCode"
                                     :code-type="state.dataCodeType"
                                     @update:code="state.dataCode = $event"
                                     @update:code-type="state.dataCodeType = $event"
                                     @update:parsed-object="handleUpdateData"
                                     @expand="handleExpand('Data')"
                        />
                    </p-pane-layout>
                </div>
            </section>
            <section>
                <p-heading heading-type="sub">
                    Dynamic UI
                </p-heading>
                <p-pane-layout class="dynamic-ui-wrapper">
                    <p-dynamic-layout :schema="state.schema" />
                </p-pane-layout>
            </section>
        </div>
        <code-editor-modal :visible="state.modalVisible"
                           :title="state.modalTitle"
                           :code="state.modalTitle === 'Schema' ? state.schemaCode : state.dataCode"
                           :code-type="state.modalTitle === 'Schema' ? state.schemaCodeType : state.dataCodeType"
                           @close="state.modalVisible = false"
                           @confirm="handleModalConfirm"
        />
    </div>
</template>

<style scoped lang="postcss">
.main-page {
    padding: 2rem;
    .page-contents {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    .input-sections-wrapper {
        display: flex;
        gap: 1rem;
        overflow: hidden;
        .input-section {
            width: calc(50% - 0.5rem);
        }
        .edit-wrapper {
            padding: 1rem;
        }

        @screen tablet {
            flex-direction: column;
        }
    }
    .dynamic-ui-wrapper {
        padding: 1rem;
    }
}
</style>
