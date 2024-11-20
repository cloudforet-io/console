import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae/src';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { WorkspaceReferenceMap, WorkspaceItem } from '@/store/reference/workspace-reference-store';

import { useFieldValidator } from '@/common/composables/form-validator';

const WORKSPACE_SELECTION_TYPES = {
    all: {
        name: 'all',
        label: 'All Workspaces',
    },
    specific: {
        name: 'specific',
        label: 'Specific Workspaces',
    },
};
export type WorkspaceScope = 'unset'|'all'|'specific';

export const useWorkspaceField = ({
    workspaceReferenceMap,
}: {
    workspaceReferenceMap: Ref<WorkspaceReferenceMap|null>;
}) => {
    const workspaceScopes = computed<WorkspaceScope[]>(() => ['unset', 'all', 'specific']);
    const currentWorkspaceScope = ref<WorkspaceScope>('unset');

    const workspaceValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
        (value) => {
            if (currentWorkspaceScope.value === 'specific') {
                return value.length > 0 ? true : 'One or more workspaces are required';
            }
            return true;
        },
    );
    const selectedWorkspaceItems = workspaceValidator.value;
    const selectedWorkspaceIds = computed<string[]>(() => {
        if (currentWorkspaceScope.value === 'all') return [];
        return selectedWorkspaceItems.value.map((w) => w.name);
    });

    const allWorkspaceItems = computed<WorkspaceItem[]>(() => (workspaceReferenceMap.value ? Object.values(workspaceReferenceMap.value) : []));
    const workspaceItemsByPackage = computed<Record<string, WorkspaceItem[]>>(() => {
        const map: Record<string, WorkspaceItem[]> = {};
        Object.values(allWorkspaceItems.value).forEach((item) => {
            if (Array.isArray(map[item.name])) {
                map[item.name].push(item);
            } else {
                map[item.name] = [item];
            }
        });
        return map;
    });
    const workspaceMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
        const filteredItems = allWorkspaceItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    const handleChangeWorkspaceSelectionType = (type: WorkspaceScope) => {
        if (currentWorkspaceScope.value === type) return;
        workspaceValidator.setValue([]);
        workspaceValidator.resetValidation();
        currentWorkspaceScope.value = type;
    };
    const handleUpdateSelectedWorkspaces = (selectedWorkspaces: SelectDropdownMenuItem[]) => {
        workspaceValidator.setValue(selectedWorkspaces);
    };

    const setInitialWorkspaces = (packageId?: string) => {
        if (!packageId) { // create case
            currentWorkspaceScope.value = 'unset';
            workspaceValidator.setValue([]);
        } else { // edit case
            const prevSelectedWorkspaceItems = workspaceItemsByPackage.value[packageId] ?? [];
            if (prevSelectedWorkspaceItems.length === 0) { // no workspace
                currentWorkspaceScope.value = 'unset';
                workspaceValidator.setValue([]);
            } else { // edit case && has workspace
                currentWorkspaceScope.value = 'specific';
                workspaceValidator.setValue(prevSelectedWorkspaceItems);
            }
        }
    };

    return {
        WORKSPACE_SELECTION_TYPES,
        workspaceScopes,
        currentWorkspaceScope,
        selectedWorkspaceItems,
        selectedWorkspaceIds,
        workspaceValidator,
        workspaceMenuItemsHandler,
        handleChangeWorkspaceSelectionType,
        handleUpdateSelectedWorkspaces,
        setInitialWorkspaces,
    };
};
