<script setup lang="ts">
import { PHeading } from '@cloudforet/mirinae';

import CategoryForm from '@/services/itsm/components/CategoryForm.vue';
import EnableLandingPanel from '@/services/itsm/components/EnableLandingPanel.vue';
import PackageForm from '@/services/itsm/components/PackageForm.vue';
import SupportPackagePanel from '@/services/itsm/components/SupportPackagePanel.vue';
import TaskCategoryPanel from '@/services/itsm/components/TaskCategoryPanel.vue';
import TaskManagementTemplatePanel from '@/services/itsm/components/TaskManagementTemplatePanel.vue';
import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';

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

