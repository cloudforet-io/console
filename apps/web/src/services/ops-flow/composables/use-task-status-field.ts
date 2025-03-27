import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskStatusOption, TaskStatusOptions } from '@/schema/opsflow/task/type';
import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';

const EMPTY_STATUS_OPTIONS = {
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: [],
};

interface StatusItem extends SelectDropdownMenuItem {
    color?: string;
}

export const useTaskStatusField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
    const taskCategoryStore = useTaskCategoryStore();

    const taskStatusValidator = useFieldValidator<StatusItem[]>(
        [],
        isRequired ? (val) => {
            if (val.length === 0) {
                return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                    topic: i18n.t('OPSFLOW.STATUS'),
                    particle: getParticle(i18n.t('OPSFLOW.STATUS') as string, 'topic'),
                });
            }
            return true;
        } : undefined,
    );
    const selectedStatusItems = taskStatusValidator.value;
    const selectedStatusId = computed<string|undefined>(() => selectedStatusItems.value[0]?.name);

    const setSelectedStatusItems = (selected: StatusItem[]) => {
        taskStatusValidator.setValue(selected);
    };

    const allStatusItems = ref<StatusItem[]>([]);
    const getStatusOptions = async (): Promise<TaskStatusOptions> => {
        if (!categoryId.value) return EMPTY_STATUS_OPTIONS;
        const category = await taskCategoryStore.get(categoryId.value);
        return category?.status_options ?? EMPTY_STATUS_OPTIONS;
    };
    const loadAllStatusItems = async () => {
        const statusOptions = await getStatusOptions();
        const items: StatusItem[] = [];
        items.push({ type: 'header', label: TASK_STATUS_LABELS.TODO, name: 'to-do' });
        items.push({ type: 'divider', name: 'todo-div' });
        statusOptions.TODO.forEach((status) => {
            items.push({ name: status.status_id, label: status.name, color: status.color });
        });
        items.push({ type: 'header', label: TASK_STATUS_LABELS.IN_PROGRESS, name: 'in-progress' });
        items.push({ type: 'divider', name: 'in-progress-div' });
        statusOptions.IN_PROGRESS.forEach((status) => {
            items.push({ name: status.status_id, label: status.name, color: status.color });
        });
        items.push({ type: 'header', label: TASK_STATUS_LABELS.COMPLETED, name: 'completed' });
        items.push({ type: 'divider', name: 'completed-div' });
        statusOptions.COMPLETED.forEach((status) => {
            items.push({ name: status.status_id, label: status.name, color: status.color });
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
                color: status.color,
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
