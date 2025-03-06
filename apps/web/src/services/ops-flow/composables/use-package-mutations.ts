import { ref } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageCreateParameters } from '@/api-clients/identity/package/schema/api-verbs/create';
import type { PackageUpdateParameters } from '@/api-clients/identity/package/schema/api-verbs/update';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { usePackageCategoryBind } from '@/services/ops-flow/composables/use-package-category-bind';
import { usePackageWorkspaceBind } from '@/services/ops-flow/composables/use-package-workspace-bind';

/*
  * usePackageMuatations includes createPackage and updatePackage mutations.
  * After creating or updating a package, it binds the package to workspaces and categories.
  */
export const usePackageMuatations = () => {
    const { applyPackageToCategories } = usePackageCategoryBind();
    const { applyPackageToWorkspaces } = usePackageWorkspaceBind();

    const bindWorkspacesAndCategories = async (packageId: string, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds) => {
        const errorMessages: string[] = [];
        const responses = await Promise.allSettled([
            applyPackageToWorkspaces(packageId, addedWorkspaceIds, removedWorkspaceIds),
            applyPackageToCategories(packageId, addedCategoryIds, removedCategoryIds),
        ]);
        responses.forEach((response) => {
            if (response.status === 'rejected') {
                errorMessages.push(response.reason.message);
            }
        });
        if (errorMessages.length) {
            throw new Error(errorMessages.join('\n'));
        }
    };

    const { packageAPI } = usePackageApi();
    const isProcessing = ref(false);

    interface CreateVariables {
      createPackageParams: PackageCreateParameters;
      addedCategoryIds: string[];
      removedCategoryIds: string[];
      addedWorkspaceIds: string[];
      removedWorkspaceIds: string[];
    }
    const { mutateAsync: createPackage } = useMutation<PackageModel, Error, CreateVariables>({
        mutationFn: ({ createPackageParams }) => packageAPI.create(createPackageParams),
        onMutate: () => {
            isProcessing.value = true;
        },
        onSettled: () => {
            isProcessing.value = false;
        },
        onSuccess: async (createdPackage, {
            addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds,
        }) => {
            await bindWorkspacesAndCategories(createdPackage.package_id, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds);
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: i18n.t('OPSFLOW.PACKAGE') }), '');
        },
        onError: (error) => {
            ErrorHandler.handleRequestError(error, i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: i18n.t('OPSFLOW.PACKAGE') }));
        },
    });

    interface UpdateVariables {
      updatePackageParams: PackageUpdateParameters;
      addedCategoryIds: string[];
      removedCategoryIds: string[];
      addedWorkspaceIds: string[];
      removedWorkspaceIds: string[];
    }
    const { mutateAsync: updatePackage } = useMutation<PackageModel, Error, UpdateVariables>({
        mutationFn: ({ updatePackageParams }) => packageAPI.update(updatePackageParams),
        onMutate: () => {
            isProcessing.value = true;
        },
        onSettled: () => {
            isProcessing.value = false;
        },
        onSuccess: async (updatedPackage, {
            addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds,
        }) => {
            await bindWorkspacesAndCategories(updatedPackage.package_id, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds);
            showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: i18n.t('OPSFLOW.PACKAGE') }), '');
        },
        onError: (error) => {
            ErrorHandler.handleRequestError(error, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.PACKAGE') }));
        },
    });

    return {
        createPackage,
        updatePackage,
        isProcessing,
    };
};
