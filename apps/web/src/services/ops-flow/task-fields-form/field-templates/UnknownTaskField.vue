<script setup lang="ts">
import {
    PFieldGroup,
} from '@cloudforet/mirinae';

import type { TaskField } from '@/api-clients/opsflow/_types/task-field-type';

import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<TaskField, any>>();


</script>

<template>
    <p-field-group :label="props.field.name"
                   :required="props.readonly ||props.field.is_required"
                   :invalid="!props.readonly"
                   :invalid-text="props.readonly ? undefined : `${props.field.field_type} is not supported`"
                   :help-text="props.readonly ? `${props.field.field_type} is not supported` : undefined"
    />
</template>
