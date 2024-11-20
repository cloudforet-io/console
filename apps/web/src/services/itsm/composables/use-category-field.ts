import type { Ref, DeepReadonly } from 'vue';
import { computed, ref } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { PackageModel } from '@/schema/identity/package/model';

import { useFieldValidator } from '@/common/composables/form-validator';

import type { useTaskCategoryStore } from '@/services/itsm/stores/admin/task-category-store';

interface CategoryItem extends SelectDropdownMenuItem {
    packageId: string;
}
export const useCategoryField = ({
    defaultPackage,
    taskCategoryStore,
}: {
    defaultPackage: DeepReadonly<Ref<PackageModel|undefined>>;
    taskCategoryStore: ReturnType<typeof useTaskCategoryStore>
}) => {
    const categoryValidator = useFieldValidator<CategoryItem[]>(
        [],
    );
    const selectedCategoryItems = categoryValidator.value;
    const selectedCategoryIds = computed<string[]>(() => selectedCategoryItems.value.map((c) => c.name));

    const handleUpdateSelectedCategories = (selectedCategories: CategoryItem[]) => {
        categoryValidator.setValue(selectedCategories);
    };

    const allCategoryItems = computed<CategoryItem[]>(() => taskCategoryStore.getters.taskCategories.map((c) => ({ name: c.category_id, label: c.name, packageId: c.package_id })) || []);
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
    const categoryMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
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
    const setInitialCategories = (packageId?: string) => {
        prevSelectedCategoryItems.value = packageId ? categoryItemsByPackage.value[packageId] ?? [] : [];
        categoryValidator.setValue(prevSelectedCategoryItems.value);
    };


    const addPackageToCategories = async (packageId: string, categoryIds: string[]) => {
        try {
            await Promise.allSettled([
                ...categoryIds.map((categoryId) => taskCategoryStore.updateCategory({
                    package_id: packageId,
                    category_id: categoryId,
                })),
            ]);
        } catch (e) {
        // TODO: handle error
        }
    };
    const bindDefaultPackageToCategories = async (categoryIds: string[]) => {
        try {
            if (!defaultPackage.value) throw new Error('Default package not found');
            const defaultPackageId = defaultPackage.value.package_id;
            await Promise.allSettled([
                ...categoryIds.map((categoryId) => taskCategoryStore.updateCategory({
                    package_id: defaultPackageId,
                    category_id: categoryId,
                })),
            ]);
        } catch (e) {
        // TODO: handle error
        }
    };
    const applyPackageToCategories = async (packageId: string) => {
        try {
            const addedCategories = selectedCategoryIds.value.filter((id) => !prevSelectedCategoryIds.value.includes(id));
            const removedCategories = prevSelectedCategoryIds.value.filter((id) => !selectedCategoryIds.value.includes(id));
            await Promise.allSettled([
                addPackageToCategories(packageId, addedCategories),
                bindDefaultPackageToCategories(removedCategories),
            ]);
        } catch (e) {
        // TODO: handle error
        }
    };

    return {
        selectedCategoryItems,
        selectedCategoryIds,
        categoryValidator,
        categoryMenuItemsHandler,
        handleUpdateSelectedCategories,
        setInitialCategories,
        applyPackageToCategories,
    };
};
