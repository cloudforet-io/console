import { computed, type Ref } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { usePackageCategoryBind } from '@/services/ops-flow/composables/use-package-category-bind';
import { usePackageQuery } from '@/services/ops-flow/composables/use-package-query';
import { usePackageWorkspaceBind } from '@/services/ops-flow/composables/use-package-workspace-bind';
import { usePackagesQuery } from '@/services/ops-flow/composables/use-packages-query';

/*
  * usePackageMutations includes createPackage and updatePackage mutations.
  * After creating or updating a package, it binds the package to workspaces and categories.
  */
export const usePackageMutations = ({
    packageId: targetPackageId,
}: {
  packageId: Ref<string | undefined>;
}) => {
    const { applyPackageToCategories } = usePackageCategoryBind();
    const { applyPackageToWorkspaces } = usePackageWorkspaceBind();
    const { packageAPI } = usePackageApi();

    interface BindInfo {
      addedCategoryIds: string[];
      removedCategoryIds: string[];
      addedWorkspaceIds: string[];
      removedWorkspaceIds: string[];
    }

    interface BindWorkspacesAndCategoriesVariables {
      packageId: string;
      bindInfo: BindInfo;
      mutateType: 'ADD' | 'EDIT';
    }

    const { invalidateQueries: invalidatePackagesQuery } = usePackagesQuery();
    const { setQueryData: setPackageQuery } = usePackageQuery({ packageId: targetPackageId, enabled: false });
    const { mutate: bindWorkspacesAndCategories } = useMutation({
        mutationFn: async ({
            packageId, bindInfo: {
                addedCategoryIds, removedCategoryIds, addedWorkspaceIds, removedWorkspaceIds,
            },
        }: BindWorkspacesAndCategoriesVariables) => {
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
        },
        onSuccess: (data, { mutateType }) => {
            showSuccessMessage(i18n.t(`OPSFLOW.ALT_S_${mutateType}_TARGET`, { target: i18n.t('OPSFLOW.PACKAGE') }), '');
        },
        onError: (error, { mutateType }) => {
            ErrorHandler.handleRequestError(error, i18n.t(`OPSFLOW.ALT_E_${mutateType}_TARGET`, { target: i18n.t('OPSFLOW.PACKAGE') }), true);
        },
    });
    interface PackageCreateVariables {
      form: {
        name: string;
        description?: string;
      };
      bindInfo: BindInfo;
    }
    const { mutate: createPackage, isPending: isCreating } = useMutation({
        mutationFn: ({ form }: PackageCreateVariables) => packageAPI.create({
            ...form,
            tags: {},
        }),
        onSuccess: (createdPackage, { bindInfo }) => {
            bindWorkspacesAndCategories({
                packageId: createdPackage.package_id,
                bindInfo,
                mutateType: 'ADD',
            });
            invalidatePackagesQuery();
        },
        onError: (error) => {
            ErrorHandler.handleRequestError(error, i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: i18n.t('OPSFLOW.PACKAGE') }), true);
        },
    });

    interface PackageUpdateVariables {
      packageId: string;
      form: {
        name?: string;
        description?: string;
      };
      bindInfo: BindInfo;
    }
    const { mutate: updatePackage, isPending: isUpdating } = useMutation({
        mutationFn: ({ packageId, form }: PackageUpdateVariables) => packageAPI.update({
            package_id: packageId,
            name: form.name,
            description: form.description,
        }),
        onSuccess: (updatedPackage, { packageId, bindInfo }) => {
            bindWorkspacesAndCategories({
                packageId,
                bindInfo,
                mutateType: 'EDIT',
            });
            setPackageQuery(updatedPackage);
            invalidatePackagesQuery();
        },
        onError: (error) => {
            ErrorHandler.handleRequestError(error, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.PACKAGE') }), true);
        },
    });

    return {
        createPackage,
        updatePackage,
        isProcessing: computed(() => isCreating.value || isUpdating.value),
    };
};
