import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useFieldValidator } from '@/common/composables/form-validator';

import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

export const useTaskTypeField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
    const taskTypeStore = useTaskTypeStore();

    const taskTypeValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
        isRequired ? (val) => {
            if (val.length === 0) return 'Please select a task type';
            return true;
        } : undefined,
    );
    const selectedTaskTypeItems = taskTypeValidator.value;
    const selectedTaskTypeId = computed<string|undefined>(() => selectedTaskTypeItems.value[0]?.name);

    const setSelectedTaskTypeItems = (selectedTaskTypes: SelectDropdownMenuItem[]) => {
        taskTypeValidator.setValue(selectedTaskTypes);
    };

    const allTaskTypeItems = ref<SelectDropdownMenuItem[]>([]);
    const loadAllTaskTypeItems = async () => {
        if (!categoryId.value) return [];
        const taskTypes = await taskTypeStore.listByCategoryId(categoryId.value);
        if (!taskTypes) return [];
        return taskTypes.map((t) => ({
            name: t.task_type_id,
            label: t.name,
        })) || [];
    };
    const taskTypeMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
        allTaskTypeItems.value = await loadAllTaskTypeItems();
        const filteredItems = allTaskTypeItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    const setInitialTaskType = (taskTypeId?: string) => {
        if (!taskTypeId) {
            taskTypeValidator.setValue([]);
            return;
        }
        const currentTaskTypeItem = allTaskTypeItems.value.find((item) => item.name === taskTypeId);
        taskTypeValidator.setValue(currentTaskTypeItem ? [currentTaskTypeItem] : []);
    };


    return {
        selectedTaskTypeItems,
        selectedTaskTypeId,
        taskTypeValidator,
        taskTypeMenuItemsHandler,
        setSelectedTaskTypeItems,
        setInitialTaskType,
    };
};
