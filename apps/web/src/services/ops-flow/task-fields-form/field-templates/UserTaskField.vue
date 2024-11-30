<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { OtherTaskField } from '@/schema/opsflow/_types/task-field-type';

import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string[]>>();

const emit = defineEmits<{(event: 'update:value', value: string[]): void;
}>();

const {
    fieldValue, setFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation<OtherTaskField, string[]>(props);

const handleUpdate = (val: string[]) => {
    setFieldValue(val);
    emit('update:value', val);
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
    >
        <user-select-dropdown :user-ids="fieldValue"
                              selection-type="multiple"
                              :invalid="isInvalid"
                              @update:user-ids="handleUpdate"
        />
    </p-field-group>
</template>
