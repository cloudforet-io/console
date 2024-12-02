<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { OtherTaskField } from '@/schema/opsflow/_types/task-field-type';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string[]>>();

const emit = defineEmits<TaskFieldFormEmits<string[]>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);
</script>

<template>
    <p-field-group :label="field.name"
                   :required="field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <project-select-dropdown class="my-1"
                                 project-selectable
                                 :project-group-selectable="false"
                                 :selected-project-ids="fieldValue"
                                 @update:selected-project-ids="updateFieldValue"
        />
    </p-field-group>
</template>
