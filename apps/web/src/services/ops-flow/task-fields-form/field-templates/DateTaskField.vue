<script setup lang="ts">
import { computed } from 'vue';

import {
    PFieldGroup, PDatetimePicker,
} from '@cloudforet/mirinae';

import type { OtherTaskField } from '@/schema/opsflow/_types/task-field-type';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string>>();

const emit = defineEmits<{(event: 'update:value', value: string): void;
}>();

const {
    fieldValue, setFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation<OtherTaskField, string>(props);

const selectedDates = computed(() => (fieldValue.value ? [fieldValue.value] : []));
const handleUpdate = (val: string[]) => {
    setFieldValue(val[0] ?? '');
    emit('update:value', val[0] ?? '');
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
    >
        <p-datetime-picker class="datetime-picker"
                           :selected-dates="selectedDates"
                           :invalid="isInvalid"
                           @update:selected-dates="handleUpdate"
        />
    </p-field-group>
</template>
