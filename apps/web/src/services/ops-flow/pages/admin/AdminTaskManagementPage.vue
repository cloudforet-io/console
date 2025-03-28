<script setup lang="ts">
import type { Component } from 'vue';
import { defineAsyncComponent, onUnmounted } from 'vue';

import { PHeading } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import EnableLandingPanel from '@/services/ops-flow/components/EnableLandingPanel.vue';
import PackagePanel from '@/services/ops-flow/components/PackagePanel.vue';
import TaskCategoryPanel from '@/services/ops-flow/components/TaskCategoryPanel.vue';
import TaskManagementTemplatePanel from '@/services/ops-flow/components/TaskManagementTemplatePanel.vue';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const PackageForm = defineAsyncComponent(() => import('@/services/ops-flow/components/PackageForm.vue')) as unknown as Component;
const PackageSetDefaultModal = defineAsyncComponent(() => import('@/services/ops-flow/components/PackageSetDefaultModal.vue')) as unknown as Component;
const PackageDeleteModal = defineAsyncComponent(() => import('@/services/ops-flow/components/PackageDeleteModal.vue')) as unknown as Component;

const TaskCategoryForm = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskCategoryForm.vue')) as unknown as Component;
const TaskCategoryDeleteModal = defineAsyncComponent(() => import('@/services/ops-flow/components/TaskCategoryDeleteModal.vue')) as unknown as Component;

const taskManagementTemplateStore = useTaskManagementTemplateStore();
const taskManagementPageStore = useTaskManagementPageStore();

onUnmounted(() => {
    taskManagementPageStore.$reset();
    taskManagementPageStore.$dispose();
});

</script>

<template>
    <div class="admin-task-management-page">
        <p-heading class="mb-6"
                   :title="i18n.t('MENU.TASK_MANAGEMENT')"
        />
        <task-management-template-panel class="mb-4" />
        <package-panel class="mb-4" />
        <task-category-panel class="mb-4" />
        <enable-landing-panel v-if="taskManagementTemplateStore.state.templateId !== 'default'" />

        <!-- package modals -->
        <package-form />
        <package-set-default-modal />
        <package-delete-modal />

        <!-- category modals -->
        <task-category-form />
        <task-category-delete-modal />
    </div>
</template>

