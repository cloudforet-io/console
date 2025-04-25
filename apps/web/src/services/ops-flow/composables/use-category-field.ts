import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import { useTaskTypesQuery } from './use-task-types-query';

interface CategoryItem extends SelectDropdownMenuItem {
    packageId: string;
}
export const useCategoryField = ({
    isRequired, hasTaskTypeOnly, categories,
}: {
    isRequired?: boolean;
    hasTaskTypeOnly?: boolean;
    categories: Ref<TaskCategoryModel[]|undefined>;
}) => {
    const categoryValidator = useFieldValidator<CategoryItem[]>(
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

    const { taskTypes } = useTaskTypesQuery({
        params: computed(() => ({
            query: { filter: [{ k: 'category_id', v: categories.value?.map((c) => c.category_id), o: 'in' }] },
        })),
        enabled: computed(() => !!categories.value),
    });
    const taskTypesByCategoryId = computed<Record<string, TaskTypeModel[]|undefined>>(() => {
        const map: Record<string, TaskTypeModel[]> = {};
        categories.value?.forEach((c) => {
            map[c.category_id] ??= taskTypes.value?.filter((t) => t.category_id === c.category_id) ?? [];
        });
        return map;
    });

    const dropdownCategoryItems = computed<CategoryItem[]>(() => {
        if (hasTaskTypeOnly) {
            return categories.value?.filter((c) => c.state !== 'DELETED')?.map((c) => {
                const tt = taskTypesByCategoryId.value[c.category_id];
                return {
                    name: c.category_id,
                    label: c.name,
                    disabled: !tt || tt.length === 0,
                    packageId: c.package_id,
                };
            }) ?? [];
        }
        return categories.value?.map((c) => ({
            name: c.category_id,
            label: c.name,
            packageId: c.package_id,
        })) ?? [];
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
    const setInitialCategory = (category?: TaskCategoryModel) => {
        prevSelectedCategoryItems.value = category ? [{ name: category.category_id, label: category.name, packageId: category.package_id }] : [];
        categoryValidator.setValue(prevSelectedCategoryItems.value);
        categoryValidator.resetValidation();
    };

    const addedCategoryItems = computed(() => selectedCategoryItems.value.filter((item) => !prevSelectedCategoryItems.value.some((c) => c.name === item.name)));
    const removedCategoryItems = computed(() => prevSelectedCategoryItems.value.filter((item) => !selectedCategoryItems.value.some((c) => c.name === item.name)));

    return {
        selectedCategoryItems,
        selectedCategoryIds,
        categoryValidator,
        categoryMenuItemsHandler,
        setSelectedCategoryItems,
        setInitialCategoriesByPackageId,
        setInitialCategory,
        addedCategoryItems,
        removedCategoryItems,
    };
};
