<script setup lang="ts">

import { computed, reactive } from 'vue';

import CodeEditor from '@/components/CodeEditor.vue';
import ViewPanel from '@/components/ViewPanel.vue';

const props = defineProps<{
    schema?: object;
    data?: any;
}>();

const state = reactive({
    schemaCode: computed(() => JSON.stringify(props.schema, null, 2)),
    dataCode: computed(() => JSON.stringify(props.data, null, 2)),
});

</script>

<template>
    <view-panel>
        <template #title-schema>
            Output Schema
        </template>
        <template #contents-schema>
            <code-editor :code="state.schemaCode"
                         code-type="Json"
                         readonly
            />
        </template>
        <template #title-data>
            Output Data
        </template>
        <template #contents-data>
            <code-editor :code="state.dataCode"
                         code-type="Json"
                         readonly
            />
        </template>
    </view-panel>
</template>
