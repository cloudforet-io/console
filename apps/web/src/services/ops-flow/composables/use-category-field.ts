import { computed, ref } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useFieldValidator } from '@/common/composables/form-validator';

import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
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
            if (val.length === 0) return 'Please select a category';
            return true;
        } : undefined,
    );
    const selectedCategoryItems = categoryValidator.value;
    const selectedCategoryIds = computed<string[]>(() => selectedCategoryItems.value.map((c) => c.name));

    const setSelectedCategoryItems = (selectedCategories: CategoryItem[]) => {
        categoryValidator.setValue(selectedCategories);
    };

    const allCategoryItems = ref<CategoryItem[]>([]);
    const categoryItemsByPackage = computed<Record<string, CategoryItem[]>>(() => {
        const map: Record<string, CategoryItem[]> = {};
        allCategoryItems.value.forEach((item) => {
            if (Array.isArray(map[item.packageId])) {
                map[item.packageId].push(item);
            } else {
                map[item.packageId] = [item];
            }
        });
        return map;
    });

    const loadAllCategoryItems = async (): Promise<CategoryItem[]> => {
        const taskCategories = await taskCategoryStore.list() ?? [];

        if (hasTaskTypeOnly) {
            await taskTypeStore.listByCategoryIds(taskCategories.map((c) => c.category_id));
            return taskCategories.filter((c) => {
                const taskTypes = taskTypeStore.state.itemsByCategoryId[c.category_id];
                return taskTypes && taskTypes.length > 0;
            }).map((c) => ({
                name: c.category_id,
                label: c.name,
                packageId: c.package_id,
            }));
        }
        return taskCategoryStore.getters.taskCategories.map((c) => ({
            name: c.category_id,
            label: c.name,
            packageId: c.package_id,
        })) || [];
    };
    const categoryMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
        allCategoryItems.value = await loadAllCategoryItems();
        const filteredItems = allCategoryItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    const prevSelectedCategoryItems = ref<CategoryItem[]>([]);
    const prevSelectedCategoryIds = computed<string[]>(() => prevSelectedCategoryItems.value.map((c) => c.name));
    const setInitialCategoriesByPackageId = async (packageId?: string) => {
        allCategoryItems.value = await loadAllCategoryItems();
        prevSelectedCategoryItems.value = packageId ? categoryItemsByPackage.value[packageId] ?? [] : [];
        categoryValidator.setValue(prevSelectedCategoryItems.value);
    };
    const setInitialCategory = async (categoryId: string) => {
        allCategoryItems.value = await loadAllCategoryItems();
        prevSelectedCategoryItems.value = allCategoryItems.value.filter((c) => c.name === categoryId);
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
    const applyPackageToCategories = async (packageId: string) => {
        const addedCategories = selectedCategoryIds.value.filter((id) => !prevSelectedCategoryIds.value.includes(id));
        const removedCategories = prevSelectedCategoryIds.value.filter((id) => !selectedCategoryIds.value.includes(id));
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
        selectedCategoryItems,
        selectedCategoryIds,
        categoryValidator,
        categoryMenuItemsHandler,
        setSelectedCategoryItems,
        setInitialCategoriesByPackageId,
        setInitialCategory,
        applyPackageToCategories,
    };
};
