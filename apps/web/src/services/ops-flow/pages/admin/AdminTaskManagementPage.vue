<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import { PHeading } from '@cloudforet/mirinae';

import EnableLandingPanel from '@/services/ops-flow/components/EnableLandingPanel.vue';
import SupportPackagePanel from '@/services/ops-flow/components/SupportPackagePanel.vue';
import TaskCategoryPanel from '@/services/ops-flow/components/TaskCategoryPanel.vue';
import TaskManagementTemplatePanel from '@/services/ops-flow/components/TaskManagementTemplatePanel.vue';

const PackageForm = defineAsyncComponent(() => import('@/services/ops-flow/components/PackageForm.vue'));
const SetDefaultPackageModal = defineAsyncComponent(() => import('@/services/ops-flow/components/SetDefaultPackageModal.vue'));
const DeletePackageModal = defineAsyncComponent(() => import('@/services/ops-flow/components/DeletePackageModal.vue'));

const CategoryForm = defineAsyncComponent(() => import('@/services/ops-flow/components/CategoryForm.vue'));

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

        <!-- package modals -->
        <package-form />
        <set-default-package-modal />
        <delete-package-modal />

        <!-- category modals -->
        <category-form />
    </div>
</template>

