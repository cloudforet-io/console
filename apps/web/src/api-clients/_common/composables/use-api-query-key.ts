import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { API_QUERY_KEY_MAP } from '@/api-clients/_common/constants/api-query-key-map';
import type {
    APIQueryKeyMapService, APIQueryKeyMapResource, APIQueryKeyMapVerb, ServiceName, ResourceName, Verb,
} from '@/api-clients/_common/types/query-key-type';
import { useQueryKeyAppContext } from '@/query/_composables/use-query-key-app-context';
import { createImmutableObject } from '@/query/_helper/immutable-key-helper';
import type { QueryKeyArray } from '@/query/_types/query-key-type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


type QueryKeyArrayWithDep = QueryKeyArray & {
    addDep: (deps: Record<string, unknown>) => QueryKeyArray;
};
type ExtractParams<T> = T extends (params: infer P) => any ? P : never;

type VerbFunction<T> = {
    (params?: ExtractParams<T>): QueryKeyArrayWithDep;
    addDep: (deps: Record<string, unknown>) => QueryKeyArray;
};

type MapVerbToReturnType<T> = T extends QueryKeyArray
    ? QueryKeyArray
    : T extends (params: any) => any
        ? VerbFunction<T>
        : never;

type UseAPIQueryResult = {
    [S in APIQueryKeyMapService]: {
        [R in APIQueryKeyMapResource<S>]: {
            [V in APIQueryKeyMapVerb<S, R>]: MapVerbToReturnType<(typeof API_QUERY_KEY_MAP)[S][R][V]>;
        };
    };
};

type APIQueryKeyValue = QueryKeyArray | ((params?: Record<string, unknown>) => QueryKeyArray);

export const _useAPIQueryKey = (): ComputedRef<UseAPIQueryResult> => {
    const queryKeyAppContext = useQueryKeyAppContext('service');

    return computed(() => {
        const createKeyWithContext = <T extends APIQueryKeyValue>(queryKeyValue: T): MapVerbToReturnType<T> => {
            if (Array.isArray(queryKeyValue)) {
                return [
                    ...queryKeyAppContext.value,
                    ...createImmutableObject(queryKeyValue),
                ] as MapVerbToReturnType<T>;
            }

            const verbFunction = (params?: ExtractParams<T>) => {
                const baseKey = queryKeyValue(params);
                const result = [
                    ...queryKeyAppContext.value,
                    ...createImmutableObject(baseKey),
                ] as QueryKeyArrayWithDep;
                result.addDep = (deps) => [
                    ...queryKeyAppContext.value,
                    ...createImmutableObject(baseKey),
                    createImmutableObject(deps),
                ];
                return result;
            };

            verbFunction.addDep = (deps) => [
                ...queryKeyAppContext.value,
                ...createImmutableObject(queryKeyValue()),
                createImmutableObject(deps),
            ];
            return verbFunction as MapVerbToReturnType<T>;
        };

        return Object.entries(API_QUERY_KEY_MAP).reduce<UseAPIQueryResult>((services, [serviceName, resources]) => ({
            ...services,
            [serviceName]: Object.entries(resources).reduce((resourceMap, [resourceName, verbs]) => ({
                ...resourceMap,
                [resourceName]: Object.entries(verbs).reduce((verbMap, [verb, queryKeyValue]) => ({
                    ...verbMap,
                    [verb]: createKeyWithContext(queryKeyValue as APIQueryKeyValue),
                }), {}),
            }), {}),
        }), {} as UseAPIQueryResult);
    });
};


















interface GlobalQueryParams {
    workspaceId?: string;
    isAdminMode?: boolean;
}
export const useAPIQueryKey = <S extends ServiceName, R extends ResourceName<S>, V extends Verb<S, R>>(
    service: S,
    resource: R,
    verb: V,
    additionalGlobalParams?: Partial<GlobalQueryParams>,
): ComputedRef<QueryKey> => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _state = reactive({
        currentWorkdpaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    });

    const globalQueryParams = reactive<GlobalQueryParams>({
        workspaceId: _state.currentWorkdpaceId,
        isAdminMode: _state.isAdminMode,
        ...additionalGlobalParams,
    });

    return computed<QueryKey>(() => [service, resource, verb, { ...globalQueryParams }]);
};
