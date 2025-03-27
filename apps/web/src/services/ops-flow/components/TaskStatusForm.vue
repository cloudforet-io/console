<script setup lang="ts">
import {
    ref, computed, onBeforeMount, nextTick, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PSelectDropdown, PButton, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import { TASK_STATUS_COLOR_NAMES } from '@/api-clients/opsflow/task/schema/constant';
import type {
    TaskStatusColorName,
    TaskStatusOption,
    TaskStatusOptions,
    TaskStatusType,
} from '@/api-clients/opsflow/task/schema/type';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryStore = useTaskCategoryStore();

/* status type */
const statusIdAndNames = computed<[id: string, name: string][]>(() => Object.values(taskCategoryPageStore.getters.statusOptions).flat().map((p) => [p.status_id, p.name]));
const statusTypeItems = computed<SelectDropdownMenuItem[]>(() => [
    { label: TASK_STATUS_LABELS.TODO, name: 'TODO' },
    { label: TASK_STATUS_LABELS.IN_PROGRESS, name: 'IN_PROGRESS' },
    { label: TASK_STATUS_LABELS.COMPLETED, name: 'COMPLETED' },
]);

/* color chips */
const {
    forms: { name, statusType, color },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
    resetValidations,
} = useFormValidator({
    name: '',
    statusType: statusTypeItems.value[0] as SelectDropdownMenuItem,
    color: TASK_STATUS_COLOR_NAMES[0] as TaskStatusColorName,
}, {
    name(value: string) {
        if (!value.trim().length) {
            return _i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                topic: _i18n.t('OPSFLOW.NAME'),
                particle: getParticle(_i18n.t('OPSFLOW.NAME') as string, 'topic'),
            });
        }
        if (value.length > 50) {
            return _i18n.t('OPSFLOW.VALIDATION.LENGTH_MAX', {
                topic: _i18n.t('OPSFLOW.NAME'),
                particle: getParticle(_i18n.t('OPSFLOW.NAME') as string, 'topic'),
                length: 50,
            });
        }
        const statusId = taskCategoryPageStore.getters.targetStatusOption?.data.status_id;
        if (statusIdAndNames.value.some((p) => p[1] === value && p[0] !== statusId)) return _i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { topic: _i18n.t('OPSFLOW.NAME') });
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskCategoryPageStore.closeStatusForm();
};

const updateStatusOptions = async (categoryId: string, allStatusOptions: TaskStatusOptions, targetStatusOption: {
            type: TaskStatusType;
            data: TaskStatusOption;
        }) => {
    try {
        const newStatusOptions = cloneDeep(allStatusOptions);
        const { type, data } = targetStatusOption;
        if (statusType.value.name !== type) {
            newStatusOptions[statusType.value.name].push({
                ...data,
                name: name.value,
                color: color.value,
            });
            newStatusOptions[type] = newStatusOptions[type].filter((p) => p.status_id !== data.status_id);
        } else {
            const target = newStatusOptions[type].find((p) => p.status_id === data.status_id);
            if (!target) throw new Error('[Console Error] Failed to find target status option');
            target.name = name.value;
            target.color = color.value;
        }

        await taskCategoryStore.update({
            category_id: categoryId,
            status_options: newStatusOptions,
            force: true,
        });
        showSuccessMessage('Task status option updated successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to update task status option');
    }
};

const createStatusOption = async (categoryId: string, allStatusOptions: TaskStatusOptions) => {
    try {
        const newStatusOptions = cloneDeep(allStatusOptions);
        newStatusOptions[statusType.value.name].push({
            name: name.value,
            color: color.value,
        });

        await taskCategoryStore.update({
            category_id: categoryId,
            status_options: newStatusOptions,
            force: true,
        });
        showSuccessMessage('Task status option created successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to create task status option');
    }
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    try {
        if (!taskCategoryPageState.currentCategoryId) {
            throw new Error('Category ID is required');
        }
        loading.value = true;
        if (taskCategoryPageStore.getters.targetStatusOption) {
            await updateStatusOptions(taskCategoryPageState.currentCategoryId, taskCategoryPageStore.getters.statusOptions, taskCategoryPageStore.getters.targetStatusOption);
        } else {
            await createStatusOption(taskCategoryPageState.currentCategoryId, taskCategoryPageStore.getters.statusOptions);
        }
        taskCategoryPageStore.closeStatusForm();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    if (taskCategoryPageStore.getters.targetStatusOption) {
        const { type, data } = taskCategoryPageStore.getters.targetStatusOption;
        setForm('name', data.name);
        setForm('statusType', statusTypeItems.value.find((p) => p.name === type) ?? statusTypeItems.value[0]);
        setForm('color', data.color ?? TASK_STATUS_COLOR_NAMES[0]);
    }
});

watch([() => taskCategoryPageState.visibleStatusForm, () => taskCategoryPageStore.getters.targetStatusOption], async ([visible, target], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            statusType: statusTypeItems.value[0],
            color: TASK_STATUS_COLOR_NAMES[0],
        });
        resetValidations();
        return;
    }
    if (target) {
        const { type, data } = target;
        setForm('name', data.name);
        setForm('statusType', statusTypeItems.value.find((p) => p.name === type) ?? statusTypeItems.value[0]);
        setForm('color', data.color ?? TASK_STATUS_COLOR_NAMES[0]);
    }
});

</script>

<template>
    <p-overlay-layout :title="taskCategoryPageStore.getters.targetStatusOption ? $t('OPSFLOW.EDIT_TARGET', {
                          target: $t('OPSFLOW.STATUS'),
                      }) : $t('OPSFLOW.ADD_TARGET', {
                          target: $t('OPSFLOW.STATUS'),
                      })"
                      :visible="taskCategoryPageState.visibleStatusForm"
                      @close="handleCancelOrClose"
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
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group v-if="!taskCategoryPageStore.getters.targetStatusOption?.data?.is_default"
                               :label="$t('OPSFLOW.STATUS_TYPE')"
                               required
                               :invalid="!loading && invalidState.statusType"
                               :invalid-text="invalidTexts.statusType"
                >
                    <template #default="{ invalid }">
                        <p-select-dropdown :selected="[statusType]"
                                           :menu="statusTypeItems"
                                           :invalid="invalid"
                                           block
                                           @select="setForm('statusType', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('OPSFLOW.COLOR')"
                               required
                               :invalid="invalidState.color"
                               :invalid-text="invalidTexts.color"
                >
                    <div class="flex flex-wrap gap-1">
                        <span v-for="colorName in TASK_STATUS_COLOR_NAMES"
                              :key="colorName"
                              :class="colorName"
                              class="color-picker-chip"
                              @click="setForm('color', colorName)"
                        >
                            <p-i v-if="color === colorName"
                                 name="ic_check"
                                 class="chip-check-mark"
                                 height="1rem"
                                 width="1rem"
                                 color="inherit"
                            />
                        </span>
                    </div>
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-1 justify-end">
                <p-button style-type="transparent"
                          :disabled="loading"
                          @click="handleCancelOrClose"
                >
                    Cancel
                </p-button>
                <p-button style-type="primary"
                          :loading="loading"
                          :disabled="!isAllValid"
                          @click="handleConfirm"
                >
                    Confirm
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>

<style scoped lang="postcss">
@define-mixin color-chip-style $theme, $bg-color, $border-color, $text-color, $outline-color {
    &.$(theme) {
        background-color: $bg-color;
        border-color: $border-color;
        .chip-check-mark {
            color: $text-color;
        }

        @media (hover: hover) {
            &:hover {
                outline-color: $outline-color;
            }
        }
    }
}
.color-picker-chip {
    @apply inline-flex items-center justify-center cursor-pointer rounded-full border;
    height: 24px;
    width: 24px;
    .chip-check-mark {
        border-radius: 100%;
    }

    @media (hover: hover) {
        &:hover {
            outline-width: 2px;
            outline-style: solid;
        }
    }

    @mixin color-chip-style gray200, theme('colors.gray.200'), theme('colors.gray.300'), theme('colors.gray.700'), theme('colors.gray.100');
    @mixin color-chip-style violet200, theme('colors.violet.200'), theme('colors.violet.300'), theme('colors.violet.700'), theme('colors.violet.100');
    @mixin color-chip-style blue200, theme('colors.blue.200'), theme('colors.blue.300'), theme('colors.blue.700'), theme('colors.blue.100');
    @mixin color-chip-style peacock200, theme('colors.peacock.200'), theme('colors.peacock.300'), theme('colors.peacock.700'), theme('colors.peacock.100');
    @mixin color-chip-style green200, theme('colors.green.200'), theme('colors.green.300'), theme('colors.green.700'), theme('colors.green.100');
    @mixin color-chip-style yellow200, theme('colors.yellow.200'), theme('colors.yellow.300'), theme('colors.yellow.700'), theme('colors.yellow.100');
    @mixin color-chip-style coral200, theme('colors.coral.200'), theme('colors.coral.300'), theme('colors.coral.700'), theme('colors.coral.100');
    @mixin color-chip-style red200, theme('colors.red.200'), theme('colors.red.300'), theme('colors.red.700'), theme('colors.red.100');
}
</style>
