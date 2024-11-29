<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<TaskField, any>>();

const {
    value, setValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props);


</script>

<template>
    <p-field-group :label="field.name"
                   :required="field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
    >
        <slot :value="value"
              :invalid="isInvalid"
              :update="setValue"
        />
    </p-field-group>
</template>
