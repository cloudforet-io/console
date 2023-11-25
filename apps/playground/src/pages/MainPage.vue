<script setup lang="ts">
import { computed, reactive } from 'vue';

import { get } from 'lodash';

import {
    PPaneLayout, PHeading, PDynamicLayout,
} from '@spaceone/design-system';

import { useCodeEditor } from '@/composables/use-code-editor';
import type { SchemaType } from '@/lib/schema';
import { getSchema } from '@/lib/schema';

import CodeEditor from '@/components/CodeEditor.vue';
import CodeEditorModal from '@/components/CodeEditorModal.vue';

type Title = 'Resource Type' | 'Resource';

const {
    state: resourceTypeState,
    handleUpdateCode: handleUpdateResourceTypeCode,
    handleUpdateCodeType: handleUpdateResourceTypeCodeType,
    handleUpdateParsedObject: handleUpdateResourceTypeData,
} = useCodeEditor();

const {
    state: resourceState,
    handleUpdateCode: handleUpdateResourceCode,
    handleUpdateCodeType: handleUpdateResourceCodeType,
    handleUpdateParsedObject: handleUpdateResourceData,
} = useCodeEditor();

const state = reactive({
    modalVisible: false,
    modalTitle: 'Resource Type' as Title,
    code: computed<string>(() => (state.modalTitle === 'Resource Type' ? resourceTypeState.code : resourceState.code)),
    codeType: computed<string>(() => (state.modalTitle === 'Resource Type' ? resourceTypeState.codeType : resourceState.codeType)),
    parsedObject: computed<null|object>(() => (state.modalTitle === 'Resource Type' ? resourceTypeState.parsedObject : resourceState.parsedObject)),
    schemaType: 'table' as SchemaType,
    schema: computed(() => {
        const schema = getSchema({
            schemaType: state.schemaType,
            resourceData: resourceState.parsedObject,
            resourceTypeData: resourceTypeState.parsedObject,
        });
        return schema;
    }),
    schemaCode: computed(() => JSON.stringify(state.schema, null, 2)),
    data: computed(() => {
        let data;
        if (state.schemaType === 'table') data = resourceState.parsedObject;
        else data = resourceTypeState.parsedObject;

        if (Array.isArray(data)) {
            return data.map((item) => {
                if (get(item, 'data')) return item;
                return get(item, 'resource');
            });
        }
        if (get(data, 'data')) return data;
        return get(data, 'resource');
    }),
    dataCode: computed(() => JSON.stringify(state.data, null, 2)),
});

const handleExpand = (title: Title) => {
    state.modalTitle = title;
    state.modalVisible = true;
};
const handleModalConfirm = (code: string, codeType: string, parsedObject: object) => {
    state.modalVisible = false;
    if (state.modalTitle === 'Resource Type') {
        handleUpdateResourceTypeCode(code);
        handleUpdateResourceTypeCodeType(codeType);
        handleUpdateResourceTypeData(parsedObject);
    } else {
        handleUpdateResourceCode(code);
        handleUpdateResourceCodeType(codeType);
        handleUpdateResourceData(parsedObject);
    }
};
</script>

<template>
    <div class="main-page">
        <p-heading>Playground</p-heading>
        <div class="page-contents">
            <section class="data-input-section-wrapper">
                <div class="data-input-wrapper">
                    <p-heading heading-type="sub">
                        Resource Type Data
                    </p-heading>
                    <p-pane-layout class="edit-wrapper">
                        <code-editor :code="resourceTypeState.code"
                                     :code-type="resourceTypeState.codeType"
                                     @update:code="handleUpdateResourceTypeCode"
                                     @update:code-type="handleUpdateResourceTypeCodeType"
                                     @update:parsed-object="handleUpdateResourceTypeData"
                                     @expand="handleExpand('Resource Type')"
                        />
                    </p-pane-layout>
                </div>
                <div class="data-input-wrapper">
                    <p-heading heading-type="sub">
                        Resources Data (Array)
                    </p-heading>
                    <p-pane-layout class="edit-wrapper">
                        <code-editor :code="resourceState.code"
                                     :code-type="resourceState.codeType"
                                     @update:code="handleUpdateResourceCode"
                                     @update:code-type="handleUpdateResourceCodeType"
                                     @update:parsed-object="handleUpdateResourceData"
                                     @expand="handleExpand('Resource')"
                        />
                    </p-pane-layout>
                </div>
            </section>
            <section class="data-view-section-wrapper">
                <div class="data-view-wrapper">
                    <p-heading heading-type="sub">
                        Output Schema
                    </p-heading>
                    <p-pane-layout class="edit-wrapper">
                        <code-editor :code="state.schemaCode"
                                     code-type="Json"
                                     readonly
                        />
                    </p-pane-layout>
                </div>
                <div class="data-view-wrapper">
                    <p-heading heading-type="sub">
                        Output Data
                    </p-heading>
                    <p-pane-layout class="edit-wrapper">
                        <code-editor :code="state.dataCode"
                                     code-type="Json"
                                     readonly
                        />
                    </p-pane-layout>
                </div>
            </section>
            <section>
                <div class="input-section">
                    <p-heading heading-type="sub">
                        Dynamic UI
                    </p-heading>
                    <p-pane-layout class="dynamic-ui-wrapper">
                        <p-dynamic-layout v-if="state.schema"
                                          :name="state.schema?.name"
                                          :type="state.schema?.type"
                                          :options="state.schema?.options ?? {}"
                                          :data="state.data"
                        />
                    </p-pane-layout>
                </div>
            </section>
        </div>
        <code-editor-modal :visible="state.modalVisible"
                           :title="state.modalTitle"
                           :code="state.code"
                           :code-type="state.codeType"
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
    .data-input-section-wrapper {
        display: flex;
        gap: 1rem;
        overflow: hidden;
        .data-input-wrapper {
            width: calc(50% - 0.5rem);
        }
        .edit-wrapper {
            padding: 1rem;
        }

        @screen tablet {
            flex-direction: column;
        }
    }
    .data-view-section-wrapper {
        display: flex;
        gap: 1rem;
        overflow: hidden;
        .data-view-wrapper {
            width: calc(50% - 0.5rem);
        }
        .edit-wrapper {
            padding: 1rem;
        }
    }
    .dynamic-ui-wrapper {
        padding: 1rem;
    }
}
</style>
