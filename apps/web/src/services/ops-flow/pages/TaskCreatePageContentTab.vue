<script setup lang="ts">
import TaskContentBaseForm from '@/services/ops-flow/components/TaskContentBaseForm.vue';
import TaskFieldsForm from '@/services/ops-flow/task-fields-form/TaskFieldsForm.vue';
</script>

<template>
    <div class="pt-6 px-4 pb-10">
        <task-content-base-form class="mb-4" />
        <task-fields-form />
    </div>
</template>
