<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PButton, PDivider, PSelectCard, PEmpty, PRadioGroup, PRadio, PDataLoader,
} from '@cloudforet/mirinae';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';
import type { TaskModel } from '@/schema/opsflow/task/model';

import { useUserStore } from '@/store/user/user-store';

import { useFormValidator } from '@/common/composables/form-validator';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { TaskCreatePageQuery } from '@/services/ops-flow/types/task-create-page-type';


const router = useRouter();

const taskCategoryStore = useTaskCategoryStore();
const taskTypeStore = useTaskTypeStore();
const taskTypeState = taskTypeStore.state;
const taskStore = useTaskStore();
const userStore = useUserStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const { getProperRouteLocation } = useProperRouteLocation();

const { hasReadWriteAccess } = usePageEditableStatus();

const loading = ref(true);
const availableCategories = ref<TaskCategoryModel[]>([]);
const { forms: { category, taskType }, setForm, isAllValid } = useFormValidator({
    category: '',
    taskType: '',
}, {
    category(val: string) {
        return !!val;
    },
    taskType(val: string) {
        return !!val;
    },
});
const tasks = ref<TaskModel[]>([]);
const userId = computed(() => userStore.state.userId ?? '');
const taskQueryHelper = new QueryHelper();
const taskQuery = computed<Query>(() => taskQueryHelper.setFilters([
    { k: 'created_by', v: userId.value, o: '=' },
    { k: 'status_type', v: 'COMPLETED', o: '!=' },
]).apiQuery);
const handleChangeCategory = async (value: string) => {
    setForm('category', value);
    await taskTypeStore.listByCategoryId(value);
    setForm('taskType', taskTypeState.itemsByCategoryId[value]?.[0]?.task_type_id);
};
const handleChangeTaskType = (value: string) => {
    setForm('taskType', value);
};
const goToTaskCreatePage = () => {
    router.push(getProperRouteLocation({
        name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE._NAME,
        query: { categoryId: category.value, taskTypeId: taskType.value } as TaskCreatePageQuery,
    }));
};


onMounted(async () => {
    loading.value = true;
    let allCategories = await taskCategoryStore.list(true) ?? [];
    allCategories = allCategories.filter((c) => c.state !== 'DELETED');
    if (!allCategories.length) {
        loading.value = false;
        return;
    }
    await taskTypeStore.listByCategoryIds(allCategories.map((c) => c.category_id));
    availableCategories.value = allCategories.filter((c) => taskTypeState.itemsByCategoryId[c.category_id]?.length);
    setForm('category', availableCategories.value[0]?.category_id);
    tasks.value = await taskStore.list({ query: taskQuery.value }) ?? [];
    loading.value = false;
});
</script>

<template>
    <div class="ops-flow-landing-page">
        <div class="mb-6 text-center text-display-md font-bold">
            {{ taskManagementTemplateStore.templates.TemplateName }}
        </div>
        <p-data-loader :loading="loading"
                       :data="availableCategories"
                       loader-backdrop-color="gray.100"
                       class="min-h-72"
        >
            <div class="max-w-[712px] mx-auto">
                <div class="mb-4 pt-4 flex justify-end">
                    <!--                    <p-field-title label="Active Ticket" />-->
                    <router-link custom
                                 :to="getProperRouteLocation({
                                     name: OPS_FLOW_ROUTE.BOARD._NAME,
                                     query: {categoryId: category }
                                 })"
                    >
                        <template #default="{navigate}">
                            <p-button style-type="secondary"
                                      size="sm"
                                      class="capitalize"
                                      @click="navigate"
                            >
                                {{ $t('OPSFLOW.TASK_BOARD.VIEW_ALL_TASKS', {tasks: taskManagementTemplateStore.templates.tasks}) }}
                            </p-button>
                        </template>
                    </router-link>
                </div>
                <!--                <p-pane-layout class="mb-10 min-h-20 flex items-center justify-center">-->
                <!--                    <div v-if="tasks.length" /> -->
                <!--                    <p-empty v-else>-->
                <!--                        No Active Tickets-->
                <!--                    </p-empty>-->
                <!--                </p-pane-layout>-->
                <p-divider />
                <div class="mt-10">
                    <p class="mb-6 text-display-md">
                        {{ taskManagementTemplateStore.templates.TaskCategory }}
                    </p>
                    <div class="flex justify-center">
                        <div class="grid grid-cols-2 gap-4 justify-center items-center">
                            <p-select-card v-for="c in availableCategories"
                                           :key="c.category_id"
                                           class="category-card"
                                           :label="c.name"
                                           :value="c.category_id"
                                           :selected="category"
                                           @change="handleChangeCategory"
                            />
                        </div>
                    </div>
                </div>
                <div class="mt-10">
                    <p class="mb-6 text-display-md">
                        {{ taskManagementTemplateStore.templates.TaskType }}
                    </p>
                    <p-radio-group v-if="category">
                        <p-radio v-for="t in taskTypeState.itemsByCategoryId[category]"
                                 :key="t.task_type_id"
                                 :value="t.task_type_id"
                                 :selected="taskType"
                                 @change="handleChangeTaskType"
                        >
                            {{ t.name }}
                        </p-radio>
                    </p-radio-group>
                </div>
                <div class="mt-10 flex justify-end">
                    <p-button v-if="hasReadWriteAccess"
                              style-type="substitutive"
                              icon-right="ic_arrow-right"
                              :disabled="!isAllValid"
                              @click="goToTaskCreatePage"
                    >
                        {{ $t('COMMON.BUTTONS.NEXT') }}
                    </p-button>
                </div>
            </div>
            <template #no-data>
                <p-empty class="my-20"
                         show-image
                >
                    {{ $t('OPSFLOW.NO_AVAILABLE_TARGET', {target: taskManagementTemplateStore.templates.TaskCategory }) }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.category-card {
    @apply w-[352px] py-4;
}
</style>

