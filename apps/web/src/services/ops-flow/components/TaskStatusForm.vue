<script setup lang="ts">
import {
    computed, nextTick, watch,
} from 'vue';

import {
    POverlayLayout, PFieldGroup, PTextInput, PSelectDropdown, PButton,
} from '@cloudforet/mirinae';

import { TASK_STATUS_COLOR_NAMES } from '@/api-clients/opsflow/task/schema/constant';
import type { TaskStatusColorName } from '@/api-clients/opsflow/task/schema/type';
import { getParticle, i18n as _i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import TaskStatusColorPicker from '@/services/ops-flow/components/TaskStatusColorPicker.vue';
import { useCategoryStatusOptions } from '@/services/ops-flow/composables/use-category-status-options';
import { useStatusOptionFormMutations } from '@/services/ops-flow/composables/use-status-option-form-mutations';
import { useStatusTypeDropdownItems } from '@/services/ops-flow/composables/use-status-type-dropdown-items';
import { useTargetStatusOption } from '@/services/ops-flow/composables/use-target-status-option';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;

/* category status options */
const categoryId = computed(() => taskCategoryPageState.currentCategoryId);
const { categoryStatusOptions } = useCategoryStatusOptions({ categoryId });

/* target status option */
const targetStatusType = computed(() => taskCategoryPageState.targetStatus?.type);
const targetStatusId = computed(() => taskCategoryPageState.targetStatus?.statusId);
const { targetStatusOption } = useTargetStatusOption({ categoryStatusOptions, targetStatusType, targetStatusId });

/* status types */
const statusIdAndNames = computed<[id: string, name: string][]>(() => Object.values(categoryStatusOptions?.value ?? {}).flat().map((p) => [p.status_id, p.name]));
const { statusTypeItems } = useStatusTypeDropdownItems();

/* form */
const {
    forms: { name, statusType, color },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    resetValidations,
} = useFormValidator({
    name: '',
    statusType: statusTypeItems.value[0],
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
        const statusId = targetStatusId.value;
        if (statusIdAndNames.value.some((p) => p[1] === value && p[0] !== statusId)) return _i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { topic: _i18n.t('OPSFLOW.NAME') });
        return true;
    },
});
const hasChanges = computed(() => statusType.value.name !== targetStatusType.value // if status type is changed, update is required
|| (
    !!targetStatusOption.value
    && (name.value !== targetStatusOption.value.name || color.value !== targetStatusOption.value.color) // if name or color is changed, update is required
));

/* status options mutation */
const { createStatusOptions, updateStatusOptions, isProcessing } = useStatusOptionFormMutations({ categoryId });

/* modal event handlers */
const handleConfirm = async () => {
    if (!isAllValid.value) return;

    // if target status option exists, it is update case
    if (targetStatusOption.value && targetStatusType.value) {
        await updateStatusOptions({
            origin: targetStatusOption.value,
            originStatusType: targetStatusType.value,
            statusType: statusType.value.name,
            form: {
                name: name.value,
                color: color.value,
            },
        });
    } else {
        await createStatusOptions({
            statusType: statusType.value.name,
            form: {
                name: name.value,
                color: color.value,
            },
        });
    }
    taskCategoryPageStore.closeStatusForm();
};
const handleCancelOrClose = () => {
    taskCategoryPageStore.closeStatusForm();
};

/* form initialization */
watch([() => taskCategoryPageState.visibleStatusForm, targetStatusType, targetStatusOption], async ([visible, type, data], [prevVisible]) => {
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
    if (type && data) {
        setForm('name', data.name);
        setForm('statusType', statusTypeItems.value.find((p) => p.name === type) ?? statusTypeItems.value[0]);
        setForm('color', data.color ?? TASK_STATUS_COLOR_NAMES[0]);
    }
});

</script>

<template>
    <p-overlay-layout :title="targetStatusOption ? $t('OPSFLOW.EDIT_TARGET', {
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
                               :invalid="!isProcessing && invalidState.name"
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
                <p-field-group v-if="!targetStatusOption?.is_default"
                               :label="$t('OPSFLOW.STATUS_TYPE')"
                               required
                               :invalid="!isProcessing && invalidState.statusType"
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
                    <task-status-color-picker :color="color"
                                              @update:color="setForm('color', $event)"
                    />
                </p-field-group>
            </div>
        </template>
        <template #footer>
            <div class="py-3 px-6 flex flex-wrap gap-1 justify-end">
                <p-button style-type="transparent"
                          :disabled="isProcessing"
                          @click="handleCancelOrClose"
                >
                    {{ $t('COMMON.BUTTONS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="isProcessing"
                          :disabled="!isAllValid || !hasChanges"
                          @click="handleConfirm"
                >
                    {{ $t('COMMON.BUTTONS.CONFIRM') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>
