<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';


interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates,import/order
import {
    ref, computed, onBeforeMount, onUnmounted,
    // eslint-disable-next-line import/no-duplicates
} from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router/composables';

import {
    PHeadingLayout, PHeading, PButton, PPaneLayout, PSkeleton,
} from '@cloudforet/mirinae';

import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { i18n as _i18n } from '@/translations';

import { queryStringToString } from '@/lib/router-query-string';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';
import { useConfirmRouteLeave } from '@/common/composables/confirm-route-leave';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import TaskContentBaseForm from '@/services/ops-flow/components/TaskContentBaseForm.vue';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskContentFormStore } from '@/services/ops-flow/stores/task-content-form-store';
import TaskFieldsForm from '@/services/ops-flow/task-fields-form/TaskFieldsForm.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import type { BoardPageQuery } from '@/services/ops-flow/types/board-page-type';
import type { TaskCreatePageQueryValue } from '@/services/ops-flow/types/task-create-page-type';



const taskContentFormStore = useTaskContentFormStore();
const taskContentFormState = taskContentFormStore.state;
const taskContentFormGetters = taskContentFormStore.getters;
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* route and query */
const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();
const categoryId = computed<TaskCreatePageQueryValue['categoryId']>(() => queryStringToString(route.query.categoryId));
const taskTypeId = computed<TaskCreatePageQueryValue['taskTypeId']>(() => queryStringToString(route.query.taskTypeId));

/* header and back button */
const loading = false; // computed<boolean>(() => taskCategoryStore.getters.loading);
const headerTitle = computed<string>(() => _i18n.t('OPSFLOW.CREATE_TARGET', { target: taskManagementTemplateStore.templates.Task }) as string);
const {
    pathFrom,
    setPathFrom,
    goBack,
} = useGoBack(getProperRouteLocation({
    name: OPS_FLOW_ROUTE.BOARD._NAME,
    query: { categoryId: categoryId.value } as BoardPageQuery,
}));
const handleClickBack = () => {
    if (pathFrom.value?.name === OPS_FLOW_ROUTE.LANDING._NAME) {
        router.back();
        return;
    }
    goBack();
};

/* confirm leave modal */
const createdTask = ref<TaskModel|undefined>(undefined);
const {
    isConfirmLeaveModalVisible,
    handleBeforeRouteLeave,
    confirmRouteLeave,
    stopRouteLeave,
} = useConfirmRouteLeave({
    passConfirmation: computed(() => !taskContentFormState.hasUnsavedChanges || !!createdTask.value),
});
onBeforeRouteLeave(handleBeforeRouteLeave);

/* form button handling */
const creating = ref(false);
const handleConfirm = async () => {
    if (!taskContentFormGetters.isAllValid) return;
    creating.value = true;
    createdTask.value = await taskContentFormStore.createTask();
    creating.value = false;
    if (createdTask.value) {
        goBack();
    }
};

/* lifecycle */
onBeforeMount(() => {
    taskContentFormStore.setCurrentCategoryId(categoryId.value);
    taskContentFormStore.setCurrentTaskType(taskTypeId.value);
    taskContentFormStore.setMode(taskTypeId.value ? 'create-minimal' : 'create');
});
onUnmounted(() => {
    taskContentFormStore.$reset();
    taskContentFormStore.$dispose();
});

/* expose */
defineExpose({ setPathFrom });
</script>

<template>
    <div class="mr-auto max-w-tablet">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           @click-back-button="handleClickBack"
                >
                    <p-skeleton v-if="loading"
                                height="1.75rem"
                                width="12rem"
                    />
                    <template v-else>
                        {{ headerTitle }}
                    </template>
                </p-heading>
            </template>
        </p-heading-layout>
        <p-pane-layout class="pt-8 px-4 pb-10 mr-auto flex flex-wrap w-full gap-4">
            <p-heading class="mb-6"
                       :title="$t('OPSFLOW.TASK_BOARD.TYPE_INFO', {type: taskManagementTemplateStore.templates.TaskType})"
                       heading-type="sub"
            />
            <div class="w-full">
                <task-content-base-form class="mb-4" />
                <task-fields-form />
            </div>
        </p-pane-layout>
        <div class="py-3 flex flex-wrap gap-1 justify-end">
            <p-button style-type="transparent"
                      :disabled="creating"
                      @click="goBack()"
            >
                {{ $t('COMMON.BUTTONS.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="creating"
                      :disabled="!taskContentFormGetters.isAllValid"
                      @click="handleConfirm"
            >
                {{ $t('COMMON.BUTTONS.CONFIRM') }}
            </p-button>
        </div>
        <!-- modals -->
        <confirm-back-modal :visible="isConfirmLeaveModalVisible"
                            @confirm="confirmRouteLeave"
                            @cancel="stopRouteLeave"
        />
    </div>
</template>

