import type { Ref } from 'vue';
import { computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';
import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

import { useTaskTypesQuery } from './use-task-types-query';


export const useTaskTypeField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
    const taskManagementTemplateStore = useTaskManagementTemplateStore();

    const taskTypeValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
        isRequired ? (val) => {
            if (val.length === 0) {
                return i18n.t('OPSFLOW.VALIDATION.REQUIRED', {
                    topic: taskManagementTemplateStore.templates.taskType,
                    particle: getParticle(taskManagementTemplateStore.templates.taskType as string, 'topic'),
                });
            }
            return true;
        } : undefined,
    );
    const selectedTaskTypeItems = taskTypeValidator.value;
    const selectedTaskTypeId = computed<string|undefined>(() => selectedTaskTypeItems.value[0]?.name);

    const setSelectedTaskTypeItems = (selectedTaskTypes: SelectDropdownMenuItem[]) => {
        taskTypeValidator.setValue(selectedTaskTypes);
    };

    const { taskTypes } = useTaskTypesQuery({
        params: computed(() => ({
            query: { filter: [{ k: 'category_id', v: categoryId.value, o: 'eq' }] },
        })),
        enabled: computed(() => !!categoryId.value),
    });
    const allTaskTypeItems = computed<SelectDropdownMenuItem[]>(() => {
        if (!categoryId.value) return [];
        if (!taskTypes.value) return [];
        return taskTypes.value.map((t) => ({
            name: t.task_type_id,
            label: t.name,
        })) || [];
    });
    const taskTypeMenuItemsHandler: AutocompleteHandler = (keyword: string, pageStart = 1, pageLimit = 10) => {
        const filteredItems = allTaskTypeItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    // taskTypesdropdownKey is for the dropdown component to re-render when the allTaskTypeItems value changes
    // This is a workaround for the issue that the dropdown component does not re-render when the allTaskTypeItems value changes
    const taskTypesDropdownKey = computed<string>(() => `task-type-${allTaskTypeItems.value.map((item) => item.name).join(',')}`);

    const setInitialTaskType = (taskType?: TaskTypeModel) => {
        taskTypeValidator.setValue(taskType ? [{ name: taskType.task_type_id, label: taskType.name }] : []);
        taskTypeValidator.resetValidation();
    };


    return {
        selectedTaskTypeItems,
        selectedTaskTypeId,
        taskTypeValidator,
        taskTypeMenuItemsHandler,
        setSelectedTaskTypeItems,
        setInitialTaskType,
        taskTypesDropdownKey,
    };
};
