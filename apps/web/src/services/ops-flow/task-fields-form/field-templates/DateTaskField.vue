<script setup lang="ts">
import { computed } from 'vue';

import {
    PFieldGroup, PDatetimePicker,
} from '@cloudforet/mirinae';

import type { OtherTaskField } from '@/api-clients/opsflow/_types/task-field-type';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string>>();

const emit = defineEmits<TaskFieldFormEmits<string>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const selectedDates = computed(() => (fieldValue.value ? [fieldValue.value] : []));
const handleUpdate = (val: string[]) => {
    updateFieldValue(val[0] ?? '');
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <!-- NOTE: key is required to re-render the component when readonly prop is changed -->
        <p-datetime-picker :key="`datetime-picker-${props.readonly}`"
                           class="my-1"
                           :selected-dates="selectedDates"
                           :invalid="isInvalid"
                           :readonly="props.readonly"
                           @update:selected-dates="handleUpdate"
        />
    </p-field-group>
</template>
