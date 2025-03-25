import { useQuery, useQueryClient } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import { REFERENCE_TYPE_INFO_MAP } from '../_constants/reference-type-map-constant';
import type { ReferenceItem, ReferenceMap } from '../_types/reference-type';
import { useReferenceQueryKey } from './use-reference-query-key';
import { computed } from 'vue';

interface ReferenceQueryOptions<R extends Record<string, any>, T extends ReferenceItem> {
    resourceType: keyof typeof REFERENCE_TYPE_INFO_MAP;
    queryFn: (params: any) => Promise<ListResponse<R>>;
    getItems: (params: any) => Promise<ListResponse<R>>;
    selectFn: (data: R) => T;
}

/*
interface PublicDashboardReferenceQuery {
    list: PublicDashboard[];
    map: Record<string, ReferenceMap<ReferenceItem<PublicDashboard>>>;
    // isLoading: boolean
    // refetch: () => void;
    // invalidate: () => void;
}
*/

export const useAdvancedReferenceQuery = <R extends Record<string, any>, T extends ReferenceItem>(options: ReferenceQueryOptions<R, T>) => {
    const { resourceType, queryFn, getItems, selectFn } = options;
    const queryClient = useQueryClient();
    const _queryKey = useReferenceQueryKey();

    const mapQuery = useQuery({
        queryKey: _queryKey.value[resourceType],
        queryFn: async (params: any) => {
            const response = await queryFn(params);


            return response;
        },
        select: (data) => {
            if (!data.results?.length) return {};

            return {
                raw: data.results,
                getItem: (id: string) => {
                    const item = data.results?.find(item => item.id === id);
                    return item ? selectFn(item) : undefined;
                },
                getItems: (ids: string[]) => {
                    return ids.map(id => {
                        const item = data.results?.find(item => item.id === id);
                        return item ? selectFn(item) : undefined;
                    });
                }
            };
        },
    });


    const pendingRequests = new Map<string, Promise<any>>();
    const batchQueue = new Set<string>();
    let batchTimer: NodeJS.Timeout | null = null;

    const getReferenceItem = async (id: string) => {
        const cached = mainQuery.data?.[id];
        if (cached) return cached;

        if (pendingRequests.has(id)) {
            return pendingRequests.get(id);
        }

        const promise = new Promise((resolve, reject) => {
            batchQueue.add(id);

            if (!batchTimer) {
                batchTimer = setTimeout(async () => {
                    const ids = Array.from(batchQueue);
                    batchQueue.clear();


                    try {
                        return useQuery({
                            queryKey: [_queryKey.value[options.resourceType], 'item', id],
                            queryFn: async () => getItems({
                                query: {
                                    filter: [{
                                        k: REFERENCE_TYPE_INFO_MAP[resourceType].key,
                                        v: ids,
                                    }],
                                },
                            }),
                            select: (data) => {
                                data.results?.forEach((item) => {
                                    queryClient.setQueryData([_queryKey.value[resourceType]], (old: ListResponse<R>) => {
                                        if (!old.results?.length) return { results: [item] };
                                        return {
                                            ...old,
                                            results: [...old.results, item],
                                        };
                                    });
                                });
                                return referenceMap;
                            },
                            staleTime: 0,
                        });

                        // const response = await getItems({
                        //     query: {
                        //         filter: [{
                        //             k: REFERENCE_TYPE_INFO_MAP[resourceType].key,
                        //             v: ids,
                        //         }],
                        //     },
                        // });
                        // response.results?.forEach((item) => {
                        //     queryClient.setQueryData([_queryKey.value[resourceType]], (old: ListResponse<R>) => {
                        //         if (!old.results?.length) return { results: [item] };
                        //         return {
                        //             ...old,
                        //             results: [...old.results, item],
                        //         };
                        //     });
                        // });
                    } catch (error) {
                        reject(error);
                    } finally {
                        pendingRequests.delete(id);
                    }
                }, 50);
            }
        });

        pendingRequests.set(id, promise);
    };



    const data = computed(() => {
        get(id) {
            return mainQuery.data.value.?[id];
        }



    });


    // 4. 반환값
    return {
        // 데이터
        data: mainQuery.data,

        // 상태
        isLoading: mainQuery.isLoading,
        isError: mainQuery.isError,
        error: mainQuery.error,

        // 메서드
        getReferenceItem,

        // 원본 쿼리 객체 (필요시 접근)
        query: mainQuery,
    };
};
