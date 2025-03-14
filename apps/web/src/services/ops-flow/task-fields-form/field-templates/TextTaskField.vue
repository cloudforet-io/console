<script setup lang="ts">
import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import type { TextTaskField } from '@/api-clients/opsflow/_types/task-field-type';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type { TaskFieldFormEmits, TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<TextTaskField, string>>();

const emit = defineEmits<TaskFieldFormEmits<string>>();

const {
    fieldValue, updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <p-text-input class="my-1"
                      :value="fieldValue"
                      :placeholder="props.readonly ? undefined : props.field.options?.description"
                      :invalid="isInvalid"
                      :readonly="props.readonly"
                      block
                      @update:value="updateFieldValue"
        />
    </p-field-group>
</template>
