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
                allItems.push({ type: 'showMore', name: 'filterableDropdownShowMore', handlerRef: i });
            }
        });
        return allItems;
    });

    // pagination
    const pageNumber = ref<number[]>(attachHandlers.value.map(() => 0));
    const pageSize = isRef(_pageSize) ? _pageSize : ref(_pageSize);
    const pageStart = computed<number[]>(() => attachHandlers.value.map((d, i) => (pageNumber.value[i]) * (pageSize?.value ?? 0) + 1));
    const pageLimit = computed<number[]>(() => attachHandlers.value.map((d, i) => (pageNumber.value[i] + 1) * (pageSize?.value ?? 0)));
    const resetMenuAndPagination = (handlerIndex = 0) => {
        accumulatedItemsByAttachHandler.value.splice(handlerIndex, 1, []);
        hasNextItemsByAttachHandler.value.splice(handlerIndex, 1, false);
        pageNumber.value.splice(handlerIndex, 1, 0);
    };

    const attachLoading = ref(false);
    const filterItemsMap = computed(() => {
        const result = {};
        if (!filterItems) return result;
        filterItems.value.forEach((item) => {
            if (!item.name) return;
            result[item.name] = item;
        });
        return result;
    });
    const attachMenuItems = async (handlerIndex?: number) => {
        if (attachLoading.value) return;

        attachLoading.value = true;

        const handlerPromises = handlerIndex
            ? [attachHandlers.value[handlerIndex](
                searchText?.value ?? '',
                pageStart.value[handlerIndex],
                pageLimit.value[handlerIndex],
            )]
            : attachHandlers.value.map((handler, i) => handler(
                searchText?.value ?? '',
                pageStart.value[i],
                pageLimit.value[i],
            ));
        const promiseResults = await Promise.allSettled(handlerPromises);

        promiseResults.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                const { results, more } = result.value;
                hasNextItemsByAttachHandler.value.splice(i, 1, !!more);

                let refined = results;
                if (filterItems) {
                    refined = results.filter((item) => !item.name || !filterItemsMap.value[item.name]);
                }

                if (pageNumber.value[i] === 0) {
                    accumulatedItemsByAttachHandler.value.splice(i, 1, refined);
                } else {
                    const merged = accumulatedItemsByAttachHandler.value[i].concat(refined);
                    accumulatedItemsByAttachHandler.value.splice(i, 1, merged);
                }
                pageNumber.value.splice(i, 1, pageNumber.value[i] + 1); // increase page number for next handler's arguments - page start, page limit
            }
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
