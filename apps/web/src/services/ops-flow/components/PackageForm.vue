<script setup lang="ts">
import {
    ref, watch, nextTick,
} from 'vue';

import { isEqual } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PButton, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/src/controls/dropdown/select-dropdown/type';

import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import PackageUpdateConfirmModal from '@/services/ops-flow/components/PackageUpdateConfirmModal.vue';
import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useWorkspaceField } from '@/services/ops-flow/composables/use-workspace-field';
import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskManagementPageGetters = taskManagementPageStore.getters;
const packageStore = usePackageStore();



/* workspace */
const {
    selectedWorkspaceItems,
    workspaceMenuItemsHandler,
    workspaceValidator,
    setSelectedWorkspaces,
    setInitialWorkspaces,
    applyPackageToWorkspaces,
    addedWorkspaceItems,
    removedWorkspaceItems,
} = useWorkspaceField();
const workspaceType = ref<'unset'|'specific'>('unset');
const handleSelectUnsetWorkspace = () => {
    workspaceType.value = 'unset';
    setSelectedWorkspaces([]);
};
const handleUpdateWorkspaces = (items: SelectDropdownMenuItem[]) => {
    if (isEqual(items, selectedWorkspaceItems.value)) return;
    setSelectedWorkspaces(items);
};

/* category */
const {
    preloadCategories,
    selectedCategoryItems,
    categoryMenuItemsHandler,
    categoryValidator,
    setSelectedCategoryItems,
    setInitialCategoriesByPackageId,
    applyPackageToCategories,
    addedCategoryItems,
    removedCategoryItems,
} = useCategoryField();

/* form */
const {
    forms: {
        name, description,
    },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    resetValidations,
} = useFormValidator({
    name: '' as string,
    description: '' as string|undefined,
    categories: categoryValidator,
    workspaces: workspaceValidator,
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
        if (packageStore.getters.packages.some((p) => p.package_id !== taskManagementPageState.targetPackageId && p.name === value)) {
            return _i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { field: _i18n.t('OPSFLOW.NAME') });
        }
        return true;
    },
});

/* update confirm modal */
const visibleUpdateConfirmModal = ref(false);

/* form modal */
const loading = ref(false);
const handleCancelOrClose = () => {
    taskManagementPageStore.closePackageForm();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetPackageId();
};
const handleFormConfirm = () => {
    if (addedWorkspaceItems.value.length || removedWorkspaceItems.value.length
        || addedCategoryItems.value.length || removedCategoryItems.value.length) {
        visibleUpdateConfirmModal.value = true;
    } else {
        handleUpdateConfirm();
    }
};
const handleUpdateCancel = () => {
    visibleUpdateConfirmModal.value = false;
};
const handleUpdateConfirm = async () => {
    visibleUpdateConfirmModal.value = false;

    if (!isAllValid.value) {
        ErrorHandler.handleError(new Error('Invalid form'));
    }
    loading.value = true;
    if (taskManagementPageState.targetPackageId) {
        try {
            const updatedPackage = await packageStore.update({
                package_id: taskManagementPageState.targetPackageId,
                name: name.value,
                description: description.value,
            });
            // bind workspaces and categories
            const errorMessages: string[] = [];
            const responses = await Promise.allSettled([
                applyPackageToWorkspaces(updatedPackage.package_id),
                applyPackageToCategories(updatedPackage.package_id),
            ]);
            responses.forEach((response) => {
                if (response.status === 'rejected') {
                    errorMessages.push(response.reason.message);
                }
            });
            if (errorMessages.length) {
                throw new Error(errorMessages.join('\n'));
            }
            showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }), '');
        } catch (e) {
            ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }));
        }
    } else {
        try {
            const createdPackage = await packageStore.create({
                name: name.value,
                description: description.value,
                tags: {},
            });
            // bind workspaces and categories
            const errorMessages: string[] = [];
            const responses = await Promise.allSettled([
                applyPackageToWorkspaces(createdPackage.package_id),
                applyPackageToCategories(createdPackage.package_id),
            ]);
            responses.forEach((response) => {
                if (response.status === 'rejected') {
                    errorMessages.push(response.reason.message);
                }
            });
            if (errorMessages.length) {
                throw new Error(errorMessages.join('\n'));
            }
            showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }), '');
        } catch (e) {
            ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }));
        }
    }
    taskManagementPageStore.closePackageForm();
    loading.value = false;
};

watch([() => taskManagementPageState.visiblePackageForm, () => taskManagementPageGetters.targetPackage], async ([visible, targetPackage], [prevVisible]) => {
    if (!visible) {
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation
        setForm({
            name: '',
            description: '',
        });
        workspaceType.value = 'unset';
        await setInitialWorkspaces();
        await preloadCategories();
        setInitialCategoriesByPackageId();
        resetValidations();
        return;
    }
    if (targetPackage) {
        setForm({
            name: targetPackage.name,
            description: targetPackage.description,
        });
        await setInitialWorkspaces(targetPackage.package_id);
        if (selectedWorkspaceItems.value.length > 0) {
            workspaceType.value = 'specific';
        } else {
            workspaceType.value = 'unset';
        }
        await preloadCategories();
        setInitialCategoriesByPackageId(targetPackage.package_id);
    }
});
</script>


<template>
    <fragment>
        <p-overlay-layout :title="taskManagementPageState.targetPackageId ? $t('OPSFLOW.EDIT_TARGET', { target: $t('OPSFLOW.PACKAGE') }) : $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.PACKAGE') })"
                          :visible="taskManagementPageState.visiblePackageForm"
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
                    <p-field-group :label="$t('OPSFLOW.DESCRIPTION')"
                                   required
                                   :invalid="invalidState.description"
                                   :invalid-text="invalidTexts.description"
                    >
                        <p-textarea :value="description"
                                    :invalid="invalidState.description"
                                    :placeholder="String($t('OPSFLOW.DESCRIBE_FIELD', {
                                        field: $t('OPSFLOW.PACKAGE'),
                                        particle: getParticle( String($t('OPSFLOW.PACKAGE')), 'object')
                                    }))"
                                    @update:value="setForm('description', $event)"
                        />
                    </p-field-group>
                    <p-field-group v-if="!taskManagementPageState.targetPackageId
                                       || taskManagementPageState.targetPackageId !== taskManagementPageGetters.defaultPackage?.package_id"
                                   :invalid="invalidState.workspaces"
                                   :invalid-text="invalidTexts.workspaces"
                                   :label="$t('OPSFLOW.WORKSPACE')"
                    >
                        <div class="mt-2">
                            <p-radio-group>
                                <p-radio :selected="workspaceType"
                                         value="unset"
                                         @change="handleSelectUnsetWorkspace"
                                >
                                    {{ $t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.UNSET') }}
                                </p-radio>
                                <p-radio :selected="workspaceType"
                                         value="specific"
                                         @change="workspaceType = $event"
                                >
                                    {{ $t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.SPECIFIC_WORKSPACE') }}
                                </p-radio>
                            </p-radio-group>
                            <p-select-dropdown v-if="workspaceType === 'specific'"
                                               class="mt-2"
                                               :selected="selectedWorkspaceItems"
                                               :invalid="invalidState.workspaces"
                                               :handler="workspaceMenuItemsHandler"
                                               :page-size="10"
                                               appearance-type="badge"
                                               menu-position="left"
                                               show-select-marker
                                               multi-selectable
                                               use-fixed-menu-style
                                               block
                                               show-clear-selection
                                               is-filterable
                                               init-selected-with-handler
                                               @update:selected="handleUpdateWorkspaces"
                            />
                        </div>
                    </p-field-group>
                    <p-field-group v-if="!taskManagementPageState.targetPackageId
                                       || taskManagementPageState.targetPackageId !== taskManagementPageGetters.defaultPackage?.package_id"
                                   :label="$t('OPSFLOW.CATEGORY')"
                                   :invalid="invalidState.categories"
                                   :invalid-text="invalidTexts.categories"
                    >
                        <p-select-dropdown :selected="selectedCategoryItems"
                                           :handler="categoryMenuItemsHandler"
                                           :invalid="invalidState.categories"
                                           :page-size="10"
                                           appearance-type="badge"
                                           show-select-marker
                                           multi-selectable
                                           use-fixed-menu-style
                                           block
                                           show-clear-selection
                                           is-filterable
                                           init-selected-with-handler
                                           @update:selected="setSelectedCategoryItems"
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
                              @click="handleFormConfirm"
                    >
                        {{ $t('COMMON.BUTTONS.CONFIRM') }}
                    </p-button>
                </div>
            </template>
        </p-overlay-layout>
        <package-update-confirm-modal :visible="visibleUpdateConfirmModal"
                                      :selected-workspaces="selectedWorkspaceItems"
                                      :added-workspaces="addedWorkspaceItems"
                                      :removed-workspaces="removedWorkspaceItems"
                                      :selected-categories="selectedCategoryItems"
                                      :added-categories="addedCategoryItems"
                                      :removed-categories="removedCategoryItems"
                                      @cancel="handleUpdateCancel"
                                      @confirm="handleUpdateConfirm"
        />
    </fragment>
</template>

