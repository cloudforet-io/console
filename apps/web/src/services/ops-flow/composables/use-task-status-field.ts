import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskStatusOption, TaskStatusOptions } from '@/schema/opsflow/task/type';

import { useFieldValidator } from '@/common/composables/form-validator';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const EMPTY_STATUS_OPTIONS = {
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: [],
};

export const useTaskStatusField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
    const taskCategoryStore = useTaskCategoryStore();

    const taskStatusValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
        isRequired ? (val) => {
            if (val.length === 0) return 'Please select a status';
            return true;
        } : undefined,
    );
    const selectedStatusItems = taskStatusValidator.value;
    const selectedStatusId = computed<string|undefined>(() => selectedStatusItems.value[0]?.name);

    const setSelectedStatusItems = (selected: SelectDropdownMenuItem[]) => {
        taskStatusValidator.setValue(selected);
    };

    const allStatusItems = ref<SelectDropdownMenuItem[]>([]);
    const getStatusOptions = async (): Promise<TaskStatusOptions> => {
        if (!categoryId.value) return EMPTY_STATUS_OPTIONS;
        const category = await taskCategoryStore.get(categoryId.value);
        return category?.status_options ?? EMPTY_STATUS_OPTIONS;
    };
    const loadAllStatusItems = async () => {
        const statusOptions = await getStatusOptions();
        const items: SelectDropdownMenuItem[] = [];
        items.push({ type: 'header', label: 'To do', name: 'todo' });
        items.push({ type: 'divider', name: 'todo-div' });
        statusOptions.TODO.forEach((status) => {
            items.push({ name: status.status_id, label: status.name });
        });
        items.push({ type: 'header', label: 'In progress', name: 'in-porgress' });
        items.push({ type: 'divider', name: 'in-progress-div' });
        statusOptions.IN_PROGRESS.forEach((status) => {
            items.push({ name: status.status_id, label: status.name });
        });
        items.push({ type: 'header', label: 'Completed', name: 'completed' });
        items.push({ type: 'divider', name: 'completed-div' });
        statusOptions.COMPLETED.forEach((status) => {
            items.push({ name: status.status_id, label: status.name });
        });
        return items;
    };
    const statusMenuItemsHandler: AutocompleteHandler = async (keyword: string) => {
        allStatusItems.value = await loadAllStatusItems();
        const filteredItems = allStatusItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        return {
            results: filteredItems,
        };
    };

    const setInitialStatus = (status?: TaskStatusOption) => {
        if (status) {
            setSelectedStatusItems([{
                name: status.status_id,
                label: status.name,
            }]);
        }
    };


    return {
        selectedStatusItems,
        selectedStatusId,
        taskStatusValidator,
        statusMenuItemsHandler,
        setSelectedStatusItems,
        setInitialStatus,
    };
};
