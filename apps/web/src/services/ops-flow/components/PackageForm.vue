<script setup lang="ts">
import {
    ref, watch, nextTick,
    computed,
} from 'vue';

import { isEqual } from 'lodash';

import {
    POverlayLayout, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PButton, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { getParticle, i18n as _i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import PackageUpdateConfirmModal from '@/services/ops-flow/components/PackageUpdateConfirmModal.vue';
import { useAvailableCategories } from '@/services/ops-flow/composables/use-available-categories';
import { useCategoryField } from '@/services/ops-flow/composables/use-category-field';
import { useDefaultPackage } from '@/services/ops-flow/composables/use-default-package';
import { usePackageMutations } from '@/services/ops-flow/composables/use-package-mutations';
import { usePackageQuery } from '@/services/ops-flow/composables/use-package-query';
import { usePackagesQuery } from '@/services/ops-flow/composables/use-packages-query';
import { useWorkspaceField } from '@/services/ops-flow/composables/use-workspace-field';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;

/* package data */
const { packages } = usePackagesQuery();
const { data: targetPackage } = usePackageQuery({
    packageId: computed(() => taskManagementPageState.targetPackageId),
    enabled: computed(() => taskManagementPageState.visiblePackageForm),
});
const { defaultPackage } = useDefaultPackage();


/* workspace field */
const {
    selectedWorkspaceItems,
    workspaceMenuItemsHandler,
    workspaceValidator,
    setSelectedWorkspaces,
    setInitialWorkspaces,
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

/* category field */
const { availableCategories, isLoading: isCategoriesLoading } = useAvailableCategories();
const {
    selectedCategoryItems,
    categoryMenuItemsHandler,
    categoryValidator,
    setSelectedCategoryItems,
    setInitialCategoriesByPackageId,
    addedCategoryItems,
    removedCategoryItems,
} = useCategoryField({ categories: availableCategories });


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
        if (packages.value && packages.value.some((p) => p.package_id !== taskManagementPageState.targetPackageId && p.name === value)) {
            return _i18n.t('OPSFLOW.VALIDATION.DUPLICATED', { field: _i18n.t('OPSFLOW.NAME') });
        }
        return true;
    },
});

/* package mutations */
const { createPackage, updatePackage, isProcessing } = usePackageMutations({
    packageId: computed(() => taskManagementPageState.targetPackageId),
});

/* confirm modal */
const visibleUpdateConfirmModal = ref(false);
const handleUpdateCancel = () => {
    visibleUpdateConfirmModal.value = false;
};
const handleUpdateConfirm = async () => {
    visibleUpdateConfirmModal.value = false;

    if (!isAllValid.value) {
        ErrorHandler.handleError(new Error('Invalid form'));
    }

    const bindInfo = {
        addedCategoryIds: addedCategoryItems.value.map((item) => item.name),
        removedCategoryIds: removedCategoryItems.value.map((item) => item.name),
        addedWorkspaceIds: addedWorkspaceItems.value.map((item) => item.name),
        removedWorkspaceIds: removedWorkspaceItems.value.map((item) => item.name),
    };
    if (taskManagementPageState.targetPackageId) {
        await updatePackage({
            packageId: taskManagementPageState.targetPackageId,
            form: {
                name: name.value,
                description: description.value,
            },
            bindInfo,
        });
    } else {
        await createPackage({
            form: {
                name: name.value,
                description: description.value,
            },
            bindInfo,
        });
    }
    taskManagementPageStore.closePackageForm();
};

/* form modal */
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

/* form initialization */
watch([() => taskManagementPageState.visiblePackageForm, targetPackage, isCategoriesLoading], async ([visible, currentTargetPackage, categoriesLoading], [prevVisible]) => {
    if (categoriesLoading) return; // wait for categories

    if (!visible) { // reset form when closing
        if (!prevVisible) return; // prevent initial call
        await nextTick(); // wait for closing animation

        setForm({
            name: '',
            description: '',
        });
        workspaceType.value = 'unset';
        await setInitialWorkspaces();
        setInitialCategoriesByPackageId();
        resetValidations();
        return;
    }

    if (currentTargetPackage) {
        setForm({
            name: currentTargetPackage.name,
            description: currentTargetPackage.description,
        });
        await setInitialWorkspaces(currentTargetPackage.package_id);
        if (selectedWorkspaceItems.value.length > 0) {
            workspaceType.value = 'specific';
        } else {
            workspaceType.value = 'unset';
        }
        setInitialCategoriesByPackageId(currentTargetPackage.package_id);
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
                                       || taskManagementPageState.targetPackageId !== defaultPackage?.package_id"
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
                                       || taskManagementPageState.targetPackageId !== defaultPackage?.package_id"
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
                              :disabled="isProcessing"
                              @click="handleCancelOrClose"
                    >
                        {{ $t('COMMON.BUTTONS.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :loading="isProcessing"
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

