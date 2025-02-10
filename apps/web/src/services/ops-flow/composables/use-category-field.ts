import { computed, ref } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

interface CategoryItem extends SelectDropdownMenuItem {
    packageId: string;
}
export const useCategoryField = ({
    isRequired, hasTaskTypeOnly,
}: {
    isRequired?: boolean;
    hasTaskTypeOnly?: boolean;
} = {}) => {
    const packageStore = usePackageStore();
    const taskCategoryStore = useTaskCategoryStore();
    const taskTypeStore = useTaskTypeStore();

    const categoryValidator = useFieldValidator<SelectDropdownMenuItem[]|CategoryItem[]>(
        [],
        isRequired ? (val) => {
            if (val.length === 0) {
                return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                    topic: i18n.t('OPSFLOW.CATEGORY'),
                    particle: getParticle(i18n.t('OPSFLOW.CATEGORY') as string, 'topic'),
                });
            }
            return true;
        } : undefined,
    );
    const selectedCategoryItems = categoryValidator.value;
    const selectedCategoryIds = computed<string[]>(() => selectedCategoryItems.value.map((c) => c.name));

    const setSelectedCategoryItems = (selectedCategories: CategoryItem[]) => {
        categoryValidator.setValue(selectedCategories);
    };

    const taskCategories = computed<TaskCategoryModel[]>(() => taskCategoryStore.getters.taskCategoriesIncludingDeleted);
    const taskTypesByCategoryId = computed<Record<string, TaskTypeModel[]|undefined>>(() => taskTypeStore.state.itemsByCategoryId);
    const preloadCategories = async () => {
        await taskCategoryStore.list();
        if (hasTaskTypeOnly) {
            await taskTypeStore.listByCategoryIds(taskCategories.value.map((c) => c.category_id));
        }
    };

    const dropdownCategoryItems = computed<CategoryItem[]>(() => {
        if (hasTaskTypeOnly) {
            return taskCategories.value.filter((c) => c.state !== 'DELETED').map((c) => {
                const taskTypes = taskTypesByCategoryId.value[c.category_id];
                return {
                    name: c.category_id,
                    label: c.name,
                    disabled: !taskTypes || taskTypes.length === 0,
                    packageId: c.package_id,
                };
            });
        }
        return taskCategories.value.map((c) => ({
            name: c.category_id,
            label: c.name,
            packageId: c.package_id,
        }) || []);
    });
    const categoryItemsByPackage = computed<Record<string, CategoryItem[]>>(() => {
        const map: Record<string, CategoryItem[]> = {};
        dropdownCategoryItems.value.forEach((item) => {
            if (Array.isArray(map[item.packageId])) {
                map[item.packageId].push(item);
            } else {
                map[item.packageId] = [item];
            }
        });
        return map;
    });

    const categoryMenuItemsHandler: AutocompleteHandler = (keyword: string, pageStart = 1, pageLimit = 10) => {
        const filteredItems = dropdownCategoryItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    const prevSelectedCategoryItems = ref<CategoryItem[]>([]);
    const setInitialCategoriesByPackageId = (packageId?: string) => {
        prevSelectedCategoryItems.value = packageId ? categoryItemsByPackage.value[packageId] ?? [] : [];
        categoryValidator.setValue(prevSelectedCategoryItems.value);
    };
    const setInitialCategory = (categoryId: string) => {
        prevSelectedCategoryItems.value = taskCategoryStore.getters.taskCategoriesIncludingDeleted.filter((c) => c.category_id === categoryId).map((c) => ({
            name: c.category_id,
            label: c.name,
            packageId: c.package_id,
        }));
        categoryValidator.setValue(prevSelectedCategoryItems.value);
    };


    const addPackageToCategories = async (packageId: string, categoryIds: string[]) => {
        const responses = await Promise.allSettled([
            ...categoryIds.map((categoryId) => taskCategoryStore.update({
                package_id: packageId,
                category_id: categoryId,
            })),
        ]);
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
    const bindDefaultPackageToCategories = async (categoryIds: string[]) => {
        if (!packageStore.getters.defaultPackage) throw new Error('Default package not found');
        const defaultPackageId = packageStore.getters.defaultPackage.package_id;
        const responses = await Promise.allSettled([
            ...categoryIds.map((categoryId) => taskCategoryStore.update({
                package_id: defaultPackageId,
                category_id: categoryId,
            })),
        ]);
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
    const addedCategoryItems = computed(() => selectedCategoryItems.value.filter((item) => !prevSelectedCategoryItems.value.some((c) => c.name === item.name)));
    const removedCategoryItems = computed(() => prevSelectedCategoryItems.value.filter((item) => !selectedCategoryItems.value.some((c) => c.name === item.name)));
    const applyPackageToCategories = async (packageId: string) => {
        const addedCategories = addedCategoryItems.value.map((item) => item.name);
        const removedCategories = removedCategoryItems.value.map((item) => item.name);
        const responses = await Promise.allSettled([
            addPackageToCategories(packageId, addedCategories),
            bindDefaultPackageToCategories(removedCategories),
        ]);
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

    return {
        preloadCategories,
        selectedCategoryItems,
        selectedCategoryIds,
        categoryValidator,
        categoryMenuItemsHandler,
        setSelectedCategoryItems,
        setInitialCategoriesByPackageId,
        setInitialCategory,
        applyPackageToCategories,
        addedCategoryItems,
        removedCategoryItems,
    };
};
