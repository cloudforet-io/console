<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { TextTaskField } from '@/schema/opsflow/_types/task-field-type';

import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<TextTaskField, string[]>>();

const emit = defineEmits<{(event: 'update:value', value: string[]): void;
}>();

const {
    value, setValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props);

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
        <user-select-dropdown :selected-user-ids="value"
                              @update:user-ids="handleUpdate"
        />
    </p-field-group>
</template>
