<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { OtherTaskField } from '@/schema/opsflow/_types/task-field-type';

import LabelsInput from '@/common/components/inputs/LabelsInput.vue';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string[]>>();

const emit = defineEmits<{(event: 'update:value', value: string[]): void;
}>();

const {
    value, setValue,
    isInvalid, invalidText,
} = useTaskFieldValidation<OtherTaskField, string[]>(props);

const handleUpdate = (val: string[]) => {
    setValue(val);
    emit('update:value', val);
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
    >
        <labels-input :labels="value"
                      editable
                      @update:value="handleUpdate"
        />
    </p-field-group>
</template>
