<script setup lang="ts">
import { computed } from 'vue';

import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { ProjectTaskField } from '@/schema/opsflow/_types/task-field-type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<ProjectTaskField, string[]|string>>();

const emit = defineEmits<TaskFieldFormEmits<string[]|string>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const isProjectGroupSelectable = computed(() => {
    const matchPattern = props.field.options?.match_pattern;
    if (!matchPattern) return true;
    return RegExp(matchPattern).test('pg-');
});
const isMultipleSelection = computed<boolean>(() => props.field.selection_type === 'MULTI');
const selected = computed<string[]>(() => {
    if (!fieldValue.value) return [];
    if (isMultipleSelection.value) {
        return Array.isArray(fieldValue.value) ? fieldValue.value : [fieldValue.value as string];
    }
    return Array.isArray(fieldValue.value) ? fieldValue.value : [fieldValue.value];
});
const handleProjectSelect = (selectedProjectIds: string[]) => {
    updateFieldValue(isMultipleSelection.value ? selectedProjectIds : selectedProjectIds[0] ?? '');
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <project-select-dropdown class="my-1"
                                 block
                                 project-selectable
                                 :multi-selectable="isMultipleSelection"
                                 :project-group-selectable="isProjectGroupSelectable"
                                 :selected-project-ids="selected"
                                 :readonly="props.readonly"
                                 :invalid="isInvalid"
                                 appearance-type="stack"
                                 @update:selected-project-ids="handleProjectSelect"
        />
    </p-field-group>
</template>
