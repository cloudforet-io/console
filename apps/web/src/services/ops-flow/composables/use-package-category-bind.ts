import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDefaultPackageQuery } from '@/services/ops-flow/composables/use-default-package-query';

const useTaskCategoryUpdate = () => {
    const { taskCategoryAPI, taskCategoryQueryKey, taskCategoryListQueryKey } = useTaskCategoryApi();
    const queryClient = useQueryClient();
    const { mutateAsync: updateTaskCategory } = useMutation({
        mutationFn: taskCategoryAPI.update,
        onSuccess: (updatedCategory) => {
            queryClient.invalidateQueries({ queryKey: [...taskCategoryQueryKey.value, { category_id: updatedCategory.category_id }] });
        },
        onError: (error) => {
            ErrorHandler.handleError(error);
        },
    });
    return { updateTaskCategory, taskCategoryQueryKey, taskCategoryListQueryKey };
};

export const usePackageCategoryBind = () => {
    const queryClient = useQueryClient();
    const { updateTaskCategory, taskCategoryListQueryKey } = useTaskCategoryUpdate();
    const addPackageToCategories = async (packageId: string, categoryIds: string[]) => {
        const responses = await Promise.allSettled([
            ...categoryIds.map((categoryId) => updateTaskCategory({
                package_id: packageId,
                category_id: categoryId,
            })),
        ]);

        // Invalidate task category list query
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });

        // set error messages
        const errorMessages: string[] = [];
        responses.forEach((response, index) => {
            if (response.status === 'rejected') {
                errorMessages.push(`- Category ID: ${categoryIds[index]}, Reason: ${response.reason.message}`);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to add package to categories:\n${errorMessages.join('\n')}`);
        }
    };

    const { defaultPackage } = useDefaultPackageQuery();
    const bindDefaultPackageToCategories = async (categoryIds: string[]) => {
        if (!defaultPackage.value) throw new Error('Default package not found');
        const defaultPackageId = defaultPackage.value.package_id;
        const responses = await Promise.allSettled([
            ...categoryIds.map((categoryId) => updateTaskCategory({
                package_id: defaultPackageId,
                category_id: categoryId,
            })),
        ]);
        // Invalidate task category list query
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });

        // set error messages
        const errorMessages: string[] = [];
        responses.forEach((response, index) => {
            if (response.status === 'rejected') {
                errorMessages.push(`- Category ID: ${categoryIds[index]}, Reason: ${response.reason.message}`);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to bind default package to categories:\n${errorMessages.join('\n')}`);
        }
    };

    const applyPackageToCategories = async (packageId: string, addedCategoryIds, removedCategoryIds) => {
        const promises: Promise<unknown>[] = [];
        if (addedCategoryIds.length > 0) {
            promises.push(addPackageToCategories(packageId, addedCategoryIds));
        }
        if (removedCategoryIds.length > 0) {
            promises.push(bindDefaultPackageToCategories(removedCategoryIds));
        }
        const responses = await Promise.allSettled(promises);
        const errorMessages: string[] = [];
        responses.forEach((response) => {
            if (response.status === 'rejected') {
                errorMessages.push(response.reason.message);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to apply package to categories:\n${errorMessages.join('\n')}`);
        }
    };

    return { applyPackageToCategories };
};
