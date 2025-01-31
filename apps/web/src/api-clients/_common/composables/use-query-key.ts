import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

type QueryKey = Array<unknown>;

interface GlobalQueryParams {
    workspaceId: string;
    mode: string;
}

export const useQueryKey = (
    resourceKey: string,
    additionalGlobalParams?: Partial<GlobalQueryParams>,
): ComputedRef<QueryKey> => {
    const globalQueryParams = reactive<GlobalQueryParams>({
        workspaceId: 'defaultWorkspace', // TODO: develop
        mode: 'defaultMode', // TODO: develop
        ...additionalGlobalParams,
    });

    return computed(() => [resourceKey, { ...globalQueryParams }]);
};
