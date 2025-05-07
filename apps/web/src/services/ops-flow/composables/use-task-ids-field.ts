import type { Ref } from 'vue';
import { computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

import { useAssociatedTasksQuery } from './use-associated-tasks-query';


export const useTaskIdsField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
    const taskManagementTemplateStore = useTaskManagementTemplateStore();

    const taskIdsValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
        isRequired ? (val) => {
            if (val.length === 0) {
                const taskIdLabel = i18n.t('OPSFLOW.FIELD_ID', { field: taskManagementTemplateStore.templates.task }) as string;
                return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                    topic: taskIdLabel,
                    particle: getParticle(taskIdLabel, 'topic'),
                });
            }
            return true;
        } : undefined,
    );
    const selectedTaskIdItems = taskIdsValidator.value;

    const setSelectedTaskIdItems = (selectedTaskIds: SelectDropdownMenuItem[]) => {
        taskIdsValidator.setValue(selectedTaskIds);
    };

    const { tasks } = useAssociatedTasksQuery({
        params: computed(() => ({
            query: { filter: [{ k: 'category_id', v: categoryId.value, o: 'eq' }] },
        })),
        enabled: computed(() => !!categoryId.value),
    });
    const allTaskIdItems = computed<SelectDropdownMenuItem[]>(() => {
        if (!categoryId.value) return [];
        if (!tasks.value) return [];
        return tasks.value.map((t) => ({
            name: t.task_id,
            label: t.task_id,
        })) || [];
    });
    const taskIdMenuItemsHandler: AutocompleteHandler = (keyword: string, pageStart = 1, pageLimit = 10) => {
        const filteredItems = allTaskIdItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    // taskIdsdropdownKey is for the dropdown component to re-render when the allTaskIdItems value changes
    // This is a workaround for the issue that the dropdown component does not re-render when the allTaskIdItems value changes
    const taskIdsDropdownKey = computed<string>(() => `task-id-${allTaskIdItems.value.map((item) => item.name).join(',')}`);

    return {
        selectedTaskIdItems,
        taskIdMenuItemsHandler,
        setSelectedTaskIdItems,
        taskIdsDropdownKey,
    };
};
