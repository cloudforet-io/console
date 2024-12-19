<script setup lang="ts">
import { PButtonModal } from '@cloudforet/mirinae';

import { getParticle } from '@/translations';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const props = defineProps<{
    visible: boolean;
}>();
const emit = defineEmits<{(event: 'confirm'): void;
    (event: 'update:visible', value: boolean): void;
}>();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const handleConfirm = async () => {
    emit('confirm');
    emit('update:visible', false);
};
const handleCloseOrCancel = () => {
    emit('update:visible', false);
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    theme-color="alert"
                    :header-title="$t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                        object: $t('OPSFLOW.FIELD_GENERATOR.FIELD'),
                        particle: getParticle($t('OPSFLOW.FIELD_GENERATOR.FIELD'), 'object')
                    })"
                    size="md"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
    >
        <template #body>
            <div class="mb-4 flex items-end justify-between">
                <i18n path="OPSFLOW.FIELD_GENERATOR.FIELD_DELETE_DESC"
                      tag="p"
                      class="flex items-center text-paragraph-lg font-bold first-letter:capitalize"
                >
                    <!-- CAUTION: Do not remove the following comments. They are used to prevent auto-formatting of the template. -->
                    <!-- In this case, template tags must be in a single line to prevent inserting unnecessary spaces. -->
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <template #field>{{ $t('OPSFLOW.FIELD_GENERATOR.FIELD') }}</template>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <template #taskType>{{ taskManagementTemplateStore.templates.taskType }}</template>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <template #task>{{ taskManagementTemplateStore.templates.task }}</template>
                </i18n>
            </div>
        </template>
    </p-button-modal>
</template>
