import type { Ref } from 'vue';
import { computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskStatusOption } from '@/api-clients/opsflow/task/schema/type';
import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';

import { useCategoryStatusOptions } from './use-category-status-options';


interface StatusItem extends SelectDropdownMenuItem {
    color?: string;
}

export const useTaskStatusField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
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

    const { categoryStatusOptions } = useCategoryStatusOptions({ categoryId });
    const allStatusItems = computed<StatusItem[]>(() => {
        const items: StatusItem[] = [];
        if (!categoryStatusOptions.value) return items;
        items.push({ type: 'header', label: TASK_STATUS_LABELS.TODO, name: 'to-do' });
        items.push({ type: 'divider', name: 'todo-div' });
        categoryStatusOptions.value.TODO.forEach((status) => {
            items.push({ name: status.status_id, label: status.name, color: status.color });
        });
        items.push({ type: 'header', label: TASK_STATUS_LABELS.IN_PROGRESS, name: 'in-progress' });
        items.push({ type: 'divider', name: 'in-progress-div' });
        categoryStatusOptions.value.IN_PROGRESS.forEach((status) => {
            items.push({ name: status.status_id, label: status.name, color: status.color });
        });
        items.push({ type: 'header', label: TASK_STATUS_LABELS.COMPLETED, name: 'completed' });
        items.push({ type: 'divider', name: 'completed-div' });
        categoryStatusOptions.value.COMPLETED.forEach((status) => {
            items.push({ name: status.status_id, label: status.name, color: status.color });
        });
        return items;
    });

    const statusMenuItemsHandler: AutocompleteHandler = (keyword: string) => {
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
        } else {
            setSelectedStatusItems([]);
        }
        taskStatusValidator.resetValidation();
    };

    // taskStatusDropdownKey is for the dropdown component to re-render when the allStatusItems value changes
    // This is a workaround for the issue that the dropdown component does not re-render when the allStatusItems value changes
    const taskStatusDropdownKey = computed<string>(() => `task-status-${allStatusItems.value.map((item) => item.name).join(',')}`);


    return {
        selectedStatusItems,
        selectedStatusId,
        taskStatusValidator,
        statusMenuItemsHandler,
        setSelectedStatusItems,
        setInitialStatus,
        taskStatusDropdownKey,
    };
};
