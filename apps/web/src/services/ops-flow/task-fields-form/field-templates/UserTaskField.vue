<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { OtherTaskField } from '@/api-clients/opsflow/_types/task-field-type';

import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

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
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <user-select-dropdown class="my-1"
                              :selected-ids="fieldValue"
                              selection-type="multiple"
                              appearance-type="badge"
                              :show-user-group-list="false"
                              :invalid="isInvalid"
                              :readonly="props.readonly"
                              @update:selected-ids="updateFieldValue"
        />
    </p-field-group>
</template>
