<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButton } from '@cloudforet/mirinae';

import TaskContentBaseForm from '@/services/ops-flow/components/TaskContentBaseForm.vue';
import TaskFieldsForm from '@/services/ops-flow/task-fields-form/TaskFieldsForm.vue';

const emit = defineEmits<{(event: 'cancel', isFormFilled: boolean): void;
}>();
const isBaseFormValid = ref<boolean>(false);
const isFieldsFormValid = ref<boolean>(false);
const isAllValid = computed<boolean>(() => isBaseFormValid.value && isFieldsFormValid.value);
</script>

<template>
    <div class="pt-6 px-4 pb-10">
        <task-content-base-form class="mb-4"
                                @update:is-valid="isBaseFormValid = $event"
        />
        <task-fields-form @update:is-valid="isFieldsFormValid = $event" />
        <div class="py-3 flex flex-wrap gap-1 justify-end">
            <p-button style-type="transparent"
                      @click="emit('cancel')"
            >
                Cancel
            </p-button>
            <p-button style-type="primary"
                      :disabled="!isAllValid"
            >
                Confirm
            </p-button>
        </div>
    </div>
</template>
