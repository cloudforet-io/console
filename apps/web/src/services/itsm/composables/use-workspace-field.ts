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
    const workspaceValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
    );
    const selectedWorkspaceItems = workspaceValidator.value;
    const selectedWorkspaceIds = computed<string[]>(() => selectedWorkspaceItems.value.map((w) => w.name));

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

    const handleUpdateSelectedWorkspaces = (selectedWorkspaces: SelectDropdownMenuItem[]) => {
        workspaceValidator.setValue(selectedWorkspaces);
    };

    const prevSelectedWorkspaceItems = ref<WorkspaceItem[]>([]);
    // const prevSelectedWorkspaceIds = computed<string[]>(() => prevSelectedWorkspaceItems.value.map((w) => w.name));
    const setInitialWorkspaces = (packageId?: string) => {
        prevSelectedWorkspaceItems.value = packageId ? workspaceItemsByPackage.value[packageId] ?? [] : [];
        workspaceValidator.setValue(prevSelectedWorkspaceItems.value);
    };


    // const addPackageToWorkspaces = async (packageId: string, workspaceIds: string[]) => {
    //     try {
    //         // await Promise.allSettled([
    //         //     ...workspaceIds.map((workspaceId) => SpaceConnector.clientV2.identity.workspace.addPackage<WorkspaceAddPackageParameters>({
    //         //         package_id: packageId,
    //         //         workspace_id: workspaceId,
    //         //     })),
    //         // ]);
    //     } catch (e) {
    //     // TODO: handle error
    //     }
    // };
    // const removePackageFromWorkspaces = async (packageId: string, workspaceIds: string[]) => {
    //     try {
    //         // await Promise.allSettled([
    //         //     ...workspaceIds.map((workspaceId) => SpaceConnector.clientV2.identity.workspace.removePackage<WorkspaceRemovePackageParameters>({
    //         //         package_id: packageId,
    //         //         workspace_id: workspaceId,
    //         //     })),
    //         // ]);
    //     } catch (e) {
    //     // TODO: handle error
    //     }
    // };
    const applyPackageToWorkspaces = async () => { // (packageId: string) => {
        try {
            // const addedWorkspaces = selectedWorkspaceIds.value.filter((id) => !prevSelectedWorkspaceIds.value.includes(id));
            // const removedWorkspaces = prevSelectedWorkspaceIds.value.filter((id) => !selectedWorkspaceIds.value.includes(id));
            // await Promise.allSettled([
            //     addPackageToWorkspaces(packageId, addedWorkspaces),
            //     removePackageFromWorkspaces(packageId, removedWorkspaces),
            // ]);
        } catch (e) {
        // TODO: handle error
        }
    };

    return {
        WORKSPACE_SELECTION_TYPES,
        selectedWorkspaceItems,
        selectedWorkspaceIds,
        workspaceValidator,
        workspaceMenuItemsHandler,
        handleUpdateSelectedWorkspaces,
        setInitialWorkspaces,
        applyPackageToWorkspaces,
    };
};
