import { computed, ref, toRef } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { WorkspaceAddPackageParameters } from '@/api-clients/identity/workspace/schema/api-verbs/add-package';
import type { WorkspaceRemovePackageParameters } from '@/api-clients/identity/workspace/schema/api-verbs/remove-package';

import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

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

export const useWorkspaceField = () => {
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const workspaceReferenceMap = toRef(workspaceReferenceStore.state, 'items');
    const workspaceValidator = useFieldValidator<SelectDropdownMenuItem[]>(
        [],
    );
    const selectedWorkspaceItems = workspaceValidator.value;
    const selectedWorkspaceIds = computed<string[]>(() => selectedWorkspaceItems.value.map((w) => w.name));

    const allWorkspaceItems = computed<SelectDropdownMenuItem[]>(() => (workspaceReferenceMap.value ? Object.values(workspaceReferenceMap.value).map((d) => ({ name: d.key, label: d.label })) : []));
    const workspaceItemsByPackage = computed<Record<string, SelectDropdownMenuItem[]>>(() => {
        const map: Record<string, SelectDropdownMenuItem[]> = {};
        if (!workspaceReferenceMap.value) return map;
        Object.values(workspaceReferenceMap.value).forEach((item) => {
            const packages = item.data.packages;
            if (!packages) return;
            packages.forEach((p) => {
                if (Array.isArray(map[p])) {
                    map[p].push({ name: item.key, label: item.label });
                } else {
                    map[p] = [{ name: item.key, label: item.label }];
                }
            });
        });
        return map;
    });
    const workspaceMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
        const filteredItems = allWorkspaceItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };

    const setSelectedWorkspaces = (selectedWorkspaces: SelectDropdownMenuItem[]) => {
        workspaceValidator.setValue(selectedWorkspaces);
    };

    const prevSelectedWorkspaceItems = ref<SelectDropdownMenuItem[]>([]);
    const setInitialWorkspaces = async (packageId?: string) => {
        await workspaceReferenceStore.load();
        prevSelectedWorkspaceItems.value = packageId ? workspaceItemsByPackage.value[packageId] ?? [] : [];
        workspaceValidator.setValue(prevSelectedWorkspaceItems.value);
    };


    const addPackageToWorkspaces = async (packageId: string, workspaceIds: string[]) => {
        const responses = await Promise.allSettled([
            ...workspaceIds.map((workspaceId) => SpaceConnector.clientV2.identity.workspace.addPackage<WorkspaceAddPackageParameters>({
                package_id: packageId,
                workspace_id: workspaceId,
            })),
        ]);
        const errorMessages: string[] = [];
        responses.forEach((response, index) => {
            if (response.status === 'rejected') {
                errorMessages.push(`- Workspace ID: ${workspaceIds[index]}, Reason: ${response.reason.message}`);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to add package to workspaces:\n${errorMessages.join('\n')}`);
        }
    };
    const removePackageFromWorkspaces = async (packageId: string, workspaceIds: string[]) => {
        const responses = await Promise.allSettled([
            ...workspaceIds.map((workspaceId) => SpaceConnector.clientV2.identity.workspace.removePackage<WorkspaceRemovePackageParameters>({
                package_id: packageId,
                workspace_id: workspaceId,
            })),
        ]);
        const errorMessages: string[] = [];
        responses.forEach((response, index) => {
            if (response.status === 'rejected') {
                errorMessages.push(`- Workspace ID: ${workspaceIds[index]}, Reason: ${response.reason.message}`);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to remove package from workspaces:\n${errorMessages.join('\n')}`);
        }
    };
    const addedWorkspaceItems = computed(() => selectedWorkspaceItems.value.filter((item) => !prevSelectedWorkspaceItems.value.some((w) => w.name === item.name)));
    const removedWorkspaceItems = computed(() => prevSelectedWorkspaceItems.value.filter((item) => !selectedWorkspaceItems.value.some((w) => w.name === item.name)));
    const applyPackageToWorkspaces = async (packageId: string) => {
        const addedWorkspaces = addedWorkspaceItems.value.map((item) => item.name);
        const removedWorkspaces = removedWorkspaceItems.value.map((item) => item.name);
        const responses = await Promise.allSettled([
            addPackageToWorkspaces(packageId, addedWorkspaces),
            removePackageFromWorkspaces(packageId, removedWorkspaces),
        ]);
        const errorMessages: string[] = [];
        responses.forEach((response) => {
            if (response.status === 'rejected') {
                errorMessages.push(response.reason.message);
            }
        });
        if (errorMessages.length > 0) {
            throw new Error(`Failed to apply package to workspaces:\n${errorMessages.join('\n')}`);
        }
    };

    return {
        WORKSPACE_SELECTION_TYPES,
        selectedWorkspaceItems,
        selectedWorkspaceIds,
        workspaceValidator,
        workspaceMenuItemsHandler,
        setSelectedWorkspaces,
        setInitialWorkspaces,
        applyPackageToWorkspaces,
        addedWorkspaceItems,
        removedWorkspaceItems,
    };
};
