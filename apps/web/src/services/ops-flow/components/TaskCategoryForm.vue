<script setup lang="ts">
import { watch, nextTick, computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PButton,
} from '@cloudforet/mirinae';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n, getParticle } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCategoriesQuery } from '@/services/ops-flow/composables/use-categories-query';
import { useCategoryStatusOptions } from '@/services/ops-flow/composables/use-category-status-options';
import { useDefaultPackage } from '@/services/ops-flow/composables/use-default-package';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;

/* active status */
const enabled = computed(() => !!taskManagementPageState.visibleCategoryForm);

/* default package */
const { defaultPackage } = useDefaultPackage({ enabled });

/* task categories */
const { categories } = useCategoriesQuery({ enabled });

/* target category */
const targetCategory = computed(() => categories.value?.find((c) => c.category_id === taskManagementPageState.targetCategoryId));

/* form */
const {
    forms: { name, description },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    description: '',
}, {
    name(value: string) {
        if (!value.trim().length) {
            return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                topic: i18n.t('OPSFLOW.NAME'),
                particle: getParticle(i18n.t('OPSFLOW.NAME') as string, 'topic'),
            });
        }
        if (value.length > 50) {
            return i18n.t('OPSFLOW.VALIDATION.LENGTH_MAX', {
                topic: i18n.t('OPSFLOW.NAME'),
                particle: getParticle(i18n.t('OPSFLOW.NAME') as string, 'topic'),
                length: 50,
            });
        }
        if (categories.value?.some((p) => taskManagementPageState.targetCategoryId !== p.category_id && p.name === value)) {
            return i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { topic: i18n.t('OPSFLOW.NAME') });
        }
        return true;
    },
});

/* task category mutations */
const { taskCategoryAPI } = useTaskCategoryApi();
const { key: taskCategoryListQueryKey } = useServiceQueryKey('opsflow', 'task-category', 'list');
const { withSuffix: withTaskCategoryQueryKeySuffix } = useServiceQueryKey('opsflow', 'task-category', 'get');

const queryClient = useQueryClient();
interface UpdateVariables {
    categoryId: string;
    form: {
        name: string;
        description: string;
    };
}
const { mutateAsync: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({ categoryId, form }: UpdateVariables) => taskCategoryAPI.update({
        category_id: categoryId,
        name: form.name,
        description: form.description,
    }),
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
        queryClient.invalidateQueries({ queryKey: withTaskCategoryQueryKeySuffix(data.category_id) });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }), '');
        taskManagementPageStore.closeCategoryForm();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }));
    },
});
interface CreateVariables {
    form: {
        name: string;
        description: string;
    };
    defaultPackageId?: string;
}
const { getDefaultStatusOptions } = useCategoryStatusOptions();
const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: ({ form, defaultPackageId }: CreateVariables) => {
        if (!defaultPackageId) throw Error('Default package is not found');
        return taskCategoryAPI.create({
            name: form.name,
            description: form.description,
            package_id: defaultPackageId,
            status_options: getDefaultStatusOptions(),
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }), '');
        taskManagementPageStore.closeCategoryForm();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }), true);
    },
});
const isProcessing = computed(() => isUpdating.value || isCreating.value);


/* modal event handlers */
const handleCancelOrClose = () => {
    initForm();
    taskManagementPageStore.closeCategoryForm();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetCategoryId();
};
const handleConfirm = () => {
    if (!isAllValid.value) return;

    if (taskManagementPageState.targetCategoryId) {
        updateCategory({
            categoryId: taskManagementPageState.targetCategoryId,
            form: {
                name: name.value,
                description: description.value,
            },
        });
    } else {
        createCategory({
            form: {
                name: name.value,
                description: description.value,
            },
            defaultPackageId: defaultPackage.value?.package_id,
        });
    }
};


watch([enabled, targetCategory], async ([visible, tc], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            description: '',
        });
        resetValidations();
        return;
    }
    if (visible && tc) {
        setForm({
            name: tc.name,
            description: tc.description,
        });
    }
});
</script>

<template>
    <p-overlay-layout :title="taskManagementPageState.targetCategoryId ? $t('OPSFLOW.EDIT_TARGET', { target: $t('OPSFLOW.CATEGORY')})
                          : $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.CATEGORY')})"
                      :visible="taskManagementPageState.visibleCategoryForm"
                      @close="handleCancelOrClose"
                      @closed="handleClosed"
    >
        <template #default>
            <div class="p-6 w-full">
                <p-field-group :label="$t('OPSFLOW.NAME')"
                               required
                               :invalid="!isProcessing && invalidState.name"
                               :invalid-text="invalidTexts.name"
                >
                    <template #default="{ invalid }">
                        <p-text-input :value="name"
                                      :invalid="invalid"
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.DESCRIPTION')">
                    <p-textarea :value="description"
                                :placeholder="String($t('OPSFLOW.DESCRIBE_FIELD', {
                                    field: $t('OPSFLOW.CATEGORY'),
                                    particle: getParticle(String($t('OPSFLOW.CATEGORY')), 'object')
                                }))"
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-3 justify-end">
                <p-button style-type="transparent"
                          :disabled="isProcessing"
                          @click="handleCancelOrClose"
                >
                    {{ $t('COMMON.BUTTONS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="isProcessing"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    {{ $t('COMMON.BUTTONS.CONFIRM') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>
