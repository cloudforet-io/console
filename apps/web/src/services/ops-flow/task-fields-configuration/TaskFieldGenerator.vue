<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

import TaskFieldGeneratorDetails from '@/services/ops-flow/task-fields-configuration/TaskFieldGeneratorDetails.vue';
import TaskFieldGeneratorHeader from '@/services/ops-flow/task-fields-configuration/TaskFieldGeneratorHeader.vue';

const COMPONENT_MAP = {
    dropdown: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/task-field-options-generator/options-generators/DropdownOptionsGenerator.vue')),
    paragraph: defineAsyncComponent(() => import('@/services/ops-flow/task-fields-configuration/task-field-options-generator/options-generators/ParagraphOptionsGenerator.vue')),
};

const type = ref('dropdown');
</script>

<template>
    <div>
        <task-field-generator-header />
        <task-field-generator-details>
            <template #options>
                <component :is="COMPONENT_MAP[type]" />
            </template>
        </task-field-generator-details>
    </div>
</template>
