<script setup lang="ts">
import {
    onBeforeMount, ref, watch, nextTick,
} from 'vue';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PButton,
} from '@cloudforet/mirinae';

import { i18n, getParticle } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskManagementPageGetters = taskManagementPageStore.getters;
const taskCategoryStore = useTaskCategoryStore();

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
        if (taskCategoryStore.getters.taskCategories.some((p) => taskManagementPageState.targetCategoryId !== p.category_id && p.name === value)) {
            return i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { topic: i18n.t('OPSFLOW.NAME') });
        }
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskManagementPageStore.closeCategoryForm();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetCategoryId();
};
const handleConfirm = async () => {
    if (!isAllValid.value) return;

    try {
        loading.value = true;
        if (taskManagementPageState.targetCategoryId) {
            await taskCategoryStore.update({
                category_id: taskManagementPageState.targetCategoryId,
                name: name.value,
                description: description.value,
            });
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }), '');
        } else {
            if (!taskManagementPageGetters.defaultPackage) throw Error('Default package is not found');
            await taskCategoryStore.create({
                name: name.value,
                description: description.value,
                package_id: taskManagementPageGetters.defaultPackage.package_id,
            });
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }), '');
        }
        taskManagementPageStore.closeCategoryForm();
    } catch (e) {
        if (taskManagementPageState.targetCategoryId) {
            ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }));
        } else {
            ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: i18n.t('OPSFLOW.CATEGORY') }));
        }
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    if (taskManagementPageState.targetCategoryId) {
        const targetCategory = taskCategoryStore.getters.taskCategories.find((p) => p.category_id === taskManagementPageState.targetCategoryId);
        if (targetCategory) {
            setForm('name', targetCategory.name);
            setForm('description', targetCategory.description);
        }
    }
});

watch([() => taskManagementPageState.visibleCategoryForm, () => taskManagementPageGetters.targetCategory], async ([visible, targetCategory], [prevVisible]) => {
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
    if (targetCategory) {
        setForm({
            name: targetCategory.name,
            description: targetCategory.description,
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
                               :invalid="!loading && invalidState.name"
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
                                :placeholder="$t('OPSFLOW.DESCRIBE_FIELD', {
                                    field: $t('OPSFLOW.CATEGORY'),
                                    particle: getParticle( $t('OPSFLOW.CATEGORY'), 'object')
                                })"
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-3 justify-end">
                <p-button style-type="transparent"
                          :disabled="loading"
                          @click="handleCancelOrClose"
                >
                    {{ $t('COMMON.BUTTONS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="loading"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    {{ $t('COMMON.BUTTONS.CONFIRM') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>
