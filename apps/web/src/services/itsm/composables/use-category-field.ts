import type { Ref } from 'vue';
import { computed } from 'vue';

import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import { useFieldValidator } from '@/common/composables/form-validator';

export const useCategoryField = ({
    taskCategories,
}: {
    taskCategories: Ref<TaskCategoryModel[]|undefined>;
}) => {
    const categoryMenuItems = computed<SelectDropdownMenuItem[]>(() => taskCategories.value?.map((c) => ({ name: c.category_id, label: c.name })) || []);
    const categoryValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
        (value) => (value.length > 0 ? true : 'One or more categories are required'),
    );
    const selectedCategoryItems = categoryValidator.value;
    const categories = computed<string[]>(() => selectedCategoryItems.value.map((c) => c.name));

    const handleUpdateSelectedCategories = (selectedCategories: SelectDropdownMenuItem[]) => {
        categoryValidator.setValue(selectedCategories);
    };
    return {
        categoryMenuItems,
        selectedCategoryItems,
        categories,
        categoryValidator,
        handleUpdateSelectedCategories,
    };
};
