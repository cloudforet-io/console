<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PSelectCard, PEmpty, PDataLoader,
} from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { useAvailableCategories } from '@/services/ops-flow/composables/use-available-categories';
import { useTaskTypesQuery } from '@/services/ops-flow/composables/use-task-types-query';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { TaskCreatePageQuery } from '@/services/ops-flow/types/task-create-page-type';



const router = useRouter();

const taskManagementTemplateStore = useTaskManagementTemplateStore();


const { hasReadWriteAccess } = usePageEditableStatus();

/* categories */
const { availableCategories, isLoading: isLoadingCategories } = useAvailableCategories();
const categoriesWithTaskType = computed(() => {
    if (!availableCategories.value) return [];
    return availableCategories.value.filter((c) => !!taskTypesByCategoryId.value[c.category_id]?.length);
});

/* task types */
const { taskTypes, isLoading: isLoadingTaskTypes } = useTaskTypesQuery({
    params: computed(() => ({
        query: {
            filter: [{ k: 'category_id', v: availableCategories.value?.map((c) => c.category_id), o: 'in' }],
        },
    })),
    enabled: computed(() => !!availableCategories.value?.length),
});
const taskTypesByCategoryId = computed(() => {
    if (!taskTypes.value?.length) return {};
    // Using Object.groupBy (ES2023)
    return Object.groupBy(taskTypes.value, (taskType) => taskType.category_id);
});

/* form */
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
const handleChangeCategory = async (value: string) => {
    setForm('category', value);
    setForm('taskType', '');
};
const handleChangeTaskType = (value: string) => {
    setForm('taskType', value);
};

/* step */
const goToTaskCreatePage = () => {
    router.push({
        name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE._NAME,
        query: { categoryId: category.value, taskTypeId: taskType.value } as TaskCreatePageQuery,
    });
};
</script>

<template>
    <div class="overflow-auto">
        <div>
            <div class="mb-6 py-6 px-10 flex mobile:flex-col gap-10 items-center justify-center min-h-80 mobile:h-screen bg-image-blur">
                <div class="max-w-96">
                    <p-heading class="mb-4">
                        {{ taskManagementTemplateStore.templates.TemplateName }}
                    </p-heading>
                    <p class="text-paragraph-lg text-gray-600">
                        {{ taskManagementTemplateStore.templates.landingDescription }}
                    </p>
                </div>
                <div class="max-w-96 mobile:w-96 flex justify-center">
                    <img src="/images/opsflow-landing/img_landing_service-desk_hero.png"
                         srcset="/images/opsflow-landing/img_landing_service-desk_hero@2x.png 2x,
                         /images/opsflow-landing/img_landing_service-desk_hero@3x.png 3x"
                    >
                </div>
            </div>
            <p-data-loader :loading="isLoadingCategories || isLoadingTaskTypes"
                           :data="categoriesWithTaskType"
                           loader-backdrop-color="gray.100"
                           class="min-h-72"
            >
                <div class="max-w-[712px] mx-auto">
                    <div class="mt-10">
                        <p class="mb-6 text-display-md">
                            {{ taskManagementTemplateStore.templates.TaskCategory }}
                        </p>
                        <div class="flex justify-center">
                            <div class="grid grid-cols-2 gap-4 justify-center items-center">
                                <p-select-card v-for="c in categoriesWithTaskType"
                                               :key="c.category_id"
                                               class="select-card"
                                               :value="c.category_id"
                                               :selected="category"
                                               @change="handleChangeCategory"
                                >
                                    <div class="w-full px-6 text-center">
                                        <p class="text-label-md font-bold truncate">
                                            {{ c.name }}
                                        </p>
                                        <p class="mt-1 truncate text-label-md text-gray-500">
                                            {{ c.description }}
                                        </p>
                                    </div>
                                </p-select-card>
                            </div>
                        </div>
                    </div>
                    <div v-if="category"
                         class="mt-10"
                    >
                        <p class="mb-6 text-display-md">
                            {{ taskManagementTemplateStore.templates.TaskType }}
                        </p>
                        <div class="flex justify-center">
                            <div class="grid grid-cols-2 gap-4 justify-center items-center">
                                <p-select-card v-for="t in taskTypesByCategoryId[category]"
                                               :key="t.task_type_id"
                                               class="select-card"
                                               :label="t.name"
                                               :value="t.task_type_id"
                                               :selected="taskType"
                                               @change="handleChangeTaskType"
                                >
                                    <div class="w-full px-6 text-center">
                                        <p class="text-label-md font-bold truncate">
                                            {{ t.name }}
                                        </p>
                                        <p class="mt-1 truncate text-label-md text-gray-500">
                                            {{ t.description }}
                                        </p>
                                    </div>
                                </p-select-card>
                            </div>
                        </div>
                    </div>
                    <div class="my-10 flex justify-end">
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
    </div>
</template>

<style lang="postcss" scoped>
.bg-image-blur {
    background-image: url("@/assets/images/img_blurred-background-min.png");
    background-color: theme('colors.gray.100');
    background-blend-mode: multiply;
    background-repeat: no-repeat;
    background-size: 130% auto;

    @screen mobile {
        background-size: 115% 240%;
    }
}
.select-card {
    width: 352px;
    padding-top: 1rem;
    padding-bottom: 1rem;
    height: 4.5rem;
}
</style>

