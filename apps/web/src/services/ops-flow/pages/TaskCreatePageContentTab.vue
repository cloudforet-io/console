<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PButton } from '@cloudforet/mirinae';

import TaskContentBaseForm from '@/services/ops-flow/components/TaskContentBaseForm.vue';
import TaskFieldsForm from '@/services/ops-flow/task-fields-form/TaskFieldsForm.vue';

const router = useRouter();
</script>

<template>
    <div class="pt-6 px-4 pb-10">
        <task-content-base-form class="mb-4" />
        <task-fields-form />
        <div class="py-3 flex flex-wrap gap-1 justify-end">
            <p-button style-type="transparent"
                      @click="router.back()"
            >
                Cancel
            </p-button>
            <p-button style-type="primary">
                Confirm
            </p-button>
        </div>
    </div>
</template>
