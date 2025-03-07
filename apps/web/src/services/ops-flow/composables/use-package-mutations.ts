
import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageCreateParameters } from '@/api-clients/identity/package/schema/api-verbs/create';
import type { PackageUpdateParameters } from '@/api-clients/identity/package/schema/api-verbs/update';

import { usePackageCategoryBind } from '@/services/ops-flow/composables/use-package-category-bind';
import { usePackageWorkspaceBind } from '@/services/ops-flow/composables/use-package-workspace-bind';

/*
  * usePackageMuatations includes createPackage and updatePackage mutations.
  * After creating or updating a package, it binds the package to workspaces and categories.
  */
export const usePackageMuatations = () => {
    const { applyPackageToCategories } = usePackageCategoryBind();
    const { applyPackageToWorkspaces } = usePackageWorkspaceBind();

    const bindWorkspacesAndCategories = async (packageId: string, addedCategoryIds: string[], removedCategoryIds: string[], addedWorkspaceIds: string[], removedWorkspaceIds: string[]) => {
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

    const createPackageFn = async ({
        createPackageParams, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds,
    }: {
    createPackageParams: PackageCreateParameters;
    addedCategoryIds: string[];
    removedCategoryIds: string[];
    addedWorkspaceIds: string[];
    removedWorkspaceIds: string[];
  }) => {
        const createdPackage = await packageAPI.create(createPackageParams);
        await bindWorkspacesAndCategories(createdPackage.package_id, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds);
        return createdPackage;
    };

    const updatePackageFn = async ({
        updatePackageParams, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds,
    }: {
    updatePackageParams: PackageUpdateParameters;
    addedCategoryIds: string[];
    removedCategoryIds: string[];
    addedWorkspaceIds: string[];
    removedWorkspaceIds: string[];
  }) => {
        const updatedPackage = await packageAPI.update(updatePackageParams);
        await bindWorkspacesAndCategories(updatedPackage.package_id, addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds);
        return updatedPackage;
    };

    return {
        createPackageFn,
        updatePackageFn,
    };
};
