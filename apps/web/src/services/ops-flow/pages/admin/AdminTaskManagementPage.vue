<script setup lang="ts">
import { PHeading } from '@cloudforet/mirinae';

import CategoryForm from '@/services/ops-flow/components/CategoryForm.vue';
import EnableLandingPanel from '@/services/ops-flow/components/EnableLandingPanel.vue';
import PackageForm from '@/services/ops-flow/components/PackageForm.vue';
import SupportPackagePanel from '@/services/ops-flow/components/SupportPackagePanel.vue';
import TaskCategoryPanel from '@/services/ops-flow/components/TaskCategoryPanel.vue';
import TaskManagementTemplatePanel from '@/services/ops-flow/components/TaskManagementTemplatePanel.vue';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;

</script>

<template>
    <div class="admin-task-management-page">
        <p-heading class="mb-6"
                   title="Task Management"
        />
        <task-management-template-panel class="mb-4" />
        <support-package-panel class="mb-4" />
        <task-category-panel class="mb-4" />
        <enable-landing-panel />
        <!-- Overlay Modals -->
        <package-form :visible="taskManagementPageState.visiblePackageForm" />
        <category-form :visible="taskManagementPageState.visibleCategoryForm" />
    </div>
</template>

