import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { getParticle, i18n } from '@/translations';

import { useFieldValidator } from '@/common/composables/form-validator';

import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

import type { TaskTypeModel } from '@/api-clients/opsflow/task/schema-type/model';

export const useTaskTypeField = ({
    isRequired, categoryId,
}: {
    categoryId: Ref<string|undefined>;
    isRequired?: boolean;
}) => {
    const taskTypeStore = useTaskTypeStore();
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

    const setInitialTaskType = (taskType?: TaskTypeModel) => {
        taskTypeValidator.setValue(taskType ? [{ name: taskType.task_type_id, label: taskType.name }] : []);
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
