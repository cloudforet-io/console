import type { Ref, UnwrapRef } from 'vue';
import { computed, isRef, ref } from 'vue';

import type { MenuItem } from '@/inputs/context-menu/type';

export interface MenuAttachHandlerRes<Item extends MenuItem = MenuItem> {
    results: Item[];
    totalCount?: number;
    more?: boolean;
    title?: string;
}

export interface MenuAttachHandler<Item extends MenuItem = MenuItem> {
    (inputText: string, pageStart?: number, pageLimit?: number, filters?: Item[], resultIndex?: number):
        Promise<MenuAttachHandlerRes<Item>|MenuAttachHandlerRes<Item>[]>|
        MenuAttachHandlerRes<Item>|MenuAttachHandlerRes<Item>[];
}

interface UseContextMenuAttachOptions<Item extends MenuItem = MenuItem> {
    attachHandler?: Ref<MenuAttachHandler<Item>|undefined>; // custom handler
    menu?: Ref<Item[]>;
    searchText?: Ref<string>;
    pageSize?: Ref<number|undefined>|number;
    filterItems?: Ref<Item[]>;
}

export const useContextMenuAttach = <Item extends MenuItem = MenuItem>({
    attachHandler: _attachHandler, menu, searchText, pageSize: _pageSize, filterItems,
}: UseContextMenuAttachOptions<Item>) => {
    const defaultAttachHandler: MenuAttachHandler<Item> = (inputText, _pageStart, _pageLimit) => {
        const allItems = menu?.value ?? [];
        if (!pageSize?.value) { // do not need to slice filteredItems
            return {
                results: allItems,
                more: false,
            };
        }
        const sliced: Item[] = allItems.slice(_pageStart ? _pageStart - 1 : 0, _pageLimit);
        return {
            results: sliced,
            more: allItems.length > (_pageLimit || sliced.length),
        };
    };
    const attachHandler = computed<MenuAttachHandler<Item>>(() => {
        if (!_attachHandler?.value) return defaultAttachHandler;
        return _attachHandler.value;
    });
    const handlerResults = ref<MenuAttachHandlerRes<Item>[]>([]);
    const accumulatedItemsByAttachHandler = ref<Item[][]>([]);
    const hasNextItemsByAttachHandler = ref<boolean[]>([false]);
    const attachedMenu = computed<Item[]>(() => {
        const allItems: Item[] = [];
        accumulatedItemsByAttachHandler.value.forEach((items, i) => {
            allItems.push(...items as Item[]);
            if (hasNextItemsByAttachHandler.value[i]) {
                allItems.push({ type: 'showMore', name: `contextMenuShowMore-${i}`, _resultIndex: i } as Item);
            }
        });
        return allItems;
    });

    // pagination

    const pageNumber = ref<number[]>([]);
    const pageSize = isRef(_pageSize) ? _pageSize : ref(_pageSize);
    const getPageStart = (index?: number) => (index === undefined ? 0 : (pageNumber.value[index] ?? 0)) * (pageSize?.value ?? 0) + 1;
    const getPageLimit = (index?: number) => (index === undefined ? 1 : (pageNumber.value[index] ?? 0) + 1) * (pageSize?.value ?? 0);

    const resetMenuAndPagination = () => {
        handlerResults.value = [];
        accumulatedItemsByAttachHandler.value = [[]];
        hasNextItemsByAttachHandler.value = [];
        pageNumber.value = [];
    };

    const attachLoading = ref(false);
    const filterItemsMap = computed<Record<string, Item[]>>(() => {
        const result = {};
        if (!filterItems) return result;
        filterItems.value.forEach((item) => {
            if (!item.name) return;
            result[item.name] = item;
        });
        return result;
    });
    const getHandlerResponses = async (resultIndex?: number): Promise<MenuAttachHandlerRes<Item>[]> => {
        let responses = attachHandler.value(
            searchText?.value ?? '',
            getPageStart(resultIndex),
            getPageLimit(resultIndex),
            undefined,
            resultIndex,
        );
        if (responses instanceof Promise) responses = await responses;
        responses = Array.isArray(responses) ? responses : [responses];
        return responses;
    };
    const attachMenuItems = async (resultIndex?: number) => {
        if (attachLoading.value) return;

        attachLoading.value = true;

        const responses = await getHandlerResponses(resultIndex);
        responses.forEach(({ results, more }, i) => {
            if (resultIndex !== undefined && resultIndex !== i) return;

            hasNextItemsByAttachHandler.value.splice(i, 1, !!more);

            let refined = results;
            if (filterItems) {
                refined = results.filter((item) => !item.name || !filterItemsMap.value[item.name]);
            }

            const pageNum = pageNumber.value[i] ?? 0;
            if (pageNum === 0) {
                accumulatedItemsByAttachHandler.value.splice(i, 1, refined as UnwrapRef<Item[]>);
            } else {
                const accumulated = accumulatedItemsByAttachHandler.value[i] ?? [];
                const merged = accumulated.concat(refined as UnwrapRef<Item[]>);
                accumulatedItemsByAttachHandler.value.splice(i, 1, merged);
            }
            pageNumber.value.splice(i, 1, pageNum + 1); // increase page number for next handler's arguments - page start, page limit
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
