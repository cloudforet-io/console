import type { Ref } from 'vue';
import { computed, isRef, ref } from 'vue';

import type { MenuItem } from '@/inputs/context-menu/type';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface MenuAttachHandler {
    (inputText: string, pageStart: number, pageLimit: number): Promise<HandlerRes>|HandlerRes;
}

interface UseContextMenuAttachOptions {
    attachHandler?: Ref<MenuAttachHandler|MenuAttachHandler[]|undefined>; // custom handler
    menu?: Ref<MenuItem[]>;
    searchText?: Ref<string>;
    pageSize?: Ref<number|undefined>|number;
    filterItems?: Ref<MenuItem[]>;
}

export const useContextMenuAttach = ({
    attachHandler, menu, searchText, pageSize: _pageSize, filterItems,
}: UseContextMenuAttachOptions) => {
    const defaultAttachHandler: MenuAttachHandler = (inputText, _pageStart, _pageLimit) => {
        const allItems = menu?.value ?? [];
        if (!pageSize?.value) { // do not need to slice filteredItems
            return {
                results: allItems,
                more: false,
            };
        }
        const sliced: MenuItem[] = allItems.slice(_pageStart - 1, _pageLimit);
        return {
            results: sliced,
            more: allItems.length > _pageLimit,
        };
    };
    const attachHandlers = computed<MenuAttachHandler[]>(() => {
        if (!attachHandler?.value) return [defaultAttachHandler];
        if (Array.isArray(attachHandler.value)) return attachHandler.value;
        return [attachHandler.value];
    });
    const accumulatedItemsByAttachHandler = ref<MenuItem[][]>(attachHandlers.value.map(() => []));
    const hasNextItemsByAttachHandler = ref<boolean[]>(attachHandlers.value.map(() => false));
    const attachedMenu = computed<MenuItem[]>(() => {
        const allItems: MenuItem[] = [];
        accumulatedItemsByAttachHandler.value.forEach((items, i) => {
            allItems.push(...items);
            if (hasNextItemsByAttachHandler.value[i]) {
                allItems.push({ type: 'showMore', name: `contextMenuShowMore-${i}`, handlerRef: i });
            }
        });
        return allItems;
    });

    // pagination
    const pageNumber = ref<number[]>(attachHandlers.value.map(() => 0));
    const pageSize = isRef(_pageSize) ? _pageSize : ref(_pageSize);
    const pageStart = computed<number[]>(() => attachHandlers.value.map((d, i) => (pageNumber.value[i]) * (pageSize?.value ?? 0) + 1));
    const pageLimit = computed<number[]>(() => attachHandlers.value.map((d, i) => (pageNumber.value[i] + 1) * (pageSize?.value ?? 0)));
    const resetMenuAndPagination = () => {
        accumulatedItemsByAttachHandler.value = attachHandlers.value.map(() => []);
        hasNextItemsByAttachHandler.value = attachHandlers.value.map(() => false);
        pageNumber.value = attachHandlers.value.map(() => 0);
    };

    const attachLoading = ref(false);
    const filterItemsMap = computed<Record<string, MenuItem[]>>(() => {
        const result = {};
        if (!filterItems) return result;
        filterItems.value.forEach((item) => {
            if (!item.name) return;
            result[item.name] = item;
        });
        return result;
    });
    const getHandlerResults = async (handlerIndex?: number): Promise<HandlerRes[]> => {
        if (handlerIndex === undefined) {
            const handlerPromises = attachHandlers.value.map((handler, i) => {
                const handlerRes = handler(searchText?.value ?? '', pageStart.value[i], pageLimit.value[i]);
                if (handlerRes instanceof Promise) return handlerRes;
                return Promise.resolve(handlerRes);
            });
            const promiseResults = await Promise.allSettled(handlerPromises);
            return promiseResults.reduce((acc, result) => {
                if (result.status === 'fulfilled') {
                    acc.push(result.value);
                }
                return acc;
            }, [] as HandlerRes[]);
        }
        const handlerRes = await attachHandlers.value[handlerIndex](searchText?.value ?? '', pageStart.value[handlerIndex], pageLimit.value[handlerIndex]);
        if (handlerRes instanceof Promise) return [await handlerRes];
        return [handlerRes];
    };
    const attachMenuItems = async (handlerIndex?: number) => {
        if (attachLoading.value) return;

        attachLoading.value = true;

        const handlerResults = await getHandlerResults(handlerIndex);
        handlerResults.forEach(({ results, more }, i) => {
            const targetIndex = handlerIndex ?? i;
            hasNextItemsByAttachHandler.value.splice(targetIndex, 1, !!more);

            let refined = results;
            if (filterItems) {
                refined = results.filter((item) => !item.name || !filterItemsMap.value[item.name]);
            }

            if (pageNumber.value[targetIndex] === 0) {
                accumulatedItemsByAttachHandler.value.splice(targetIndex, 1, refined);
            } else {
                const merged = accumulatedItemsByAttachHandler.value[targetIndex].concat(refined);
                accumulatedItemsByAttachHandler.value.splice(targetIndex, 1, merged);
            }
            pageNumber.value.splice(targetIndex, 1, pageNumber.value[targetIndex] + 1); // increase page number for next handler's arguments - page start, page limit
        });

        attachLoading.value = false;
    };

    return {
        attachedMenu,
        attachLoading: computed(() => attachLoading.value),
        resetMenuAndPagination,
        attachMenuItems,
    };
};
