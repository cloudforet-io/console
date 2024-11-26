<script setup lang="ts">
import {
    ref, computed, onBeforeMount, nextTick, watch,
} from 'vue';


import {
    POverlayLayout, PFieldGroup, PTextInput, PSelectDropdown, PButton, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { TASK_STATUS_COLOR_NAMES } from '@/schema/opsflow/task/constant';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';


const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;


/* status type */
const statusIdAndNames = computed<[id: string, name: string][]>(() => Object.values(taskCategoryPageStore.getters.statusOptions).flat().map((p) => [p.status_id, p.name]));
const statusTypeItems = computed<SelectDropdownMenuItem[]>(() => [
    { label: 'To-do', name: 'TODO' },
    { label: 'In progress', name: 'IN_PROGRESS' },
    { label: 'Completed', name: 'COMPLETED' },
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
    color: '',
}, {
    name(value: string) {
        if (!value.trim().length) return 'Name is required';
        if (value.length > 50) return 'Name should be less than 50 characters';
        const statusId = taskCategoryPageGetters.targetStatusOption?.data.status_id;
        if (statusIdAndNames.value.some((p) => p[1] === value && p[0] !== statusId)) return 'Name already exists';
        return true;
    },
});

const loading = ref(false);
const handleCancelOrClose = () => {
    initForm();
    taskCategoryPageStore.closeStatusForm();
};

const handleConfirm = async () => {
    if (!isAllValid.value) return;
    if (!taskCategoryPageState.currentCategoryId) return;
    try {
        loading.value = true;
        if (taskCategoryPageGetters.targetStatusOption) {
            // await taskCategoryStore.update({
            //
            // });
        } else {
            // await taskCategoryStore.create({
            // });
        }
        taskCategoryPageStore.closeStatusForm();
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to save category');
        // TODO: handle error
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    if (taskCategoryPageGetters.targetStatusOption) {
        const { type, data } = taskCategoryPageGetters.targetStatusOption;
        setForm('name', data.name);
        setForm('statusType', statusTypeItems.value.find((p) => p.name === type) ?? statusTypeItems.value[0]);
        setForm('color', data.color ?? TASK_STATUS_COLOR_NAMES[0]);
    }
});

watch([() => taskCategoryPageState.visibleStatusForm, () => taskCategoryPageGetters.targetStatusOption], async ([visible, target], [prevVisible]) => {
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
    <p-overlay-layout :title="taskCategoryPageGetters.targetStatusOption ? 'Edit Status' : 'Add Status'"
                      :visible="taskCategoryPageState.visibleStatusForm"
                      @close="handleCancelOrClose"
    >
        <template #default>
            <div class="p-6 w-full">
                <p-field-group label="Name"
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
                <p-field-group v-if="!taskCategoryPageGetters.targetStatusOption?.data?.is_default"
                               label="Status Type"
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
                <p-field-group label="Color"
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
