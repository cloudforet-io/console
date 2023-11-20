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
        if (_pageStart === undefined || _pageLimit === undefined) { // do not need to slice items
            return {
                results: allItems,
                more: false,
            };
        }
        return {
            results: allItems.slice(_pageStart - 1, _pageStart * _pageLimit),
            more: _pageStart * _pageLimit < allItems.length + 1,
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
    const getPageStart = (resultIndex?: number) => {
        const size = pageSize?.value;
        if (!size) return undefined;
        const index = resultIndex ?? 0;
        if (pageNumber.value[index] === undefined) return 1;
        return (pageNumber.value[index] ?? 0) * size + 1;
    };
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
            pageSize?.value,
            undefined,
            resultIndex,
        );
        if (responses instanceof Promise) responses = await responses;
        responses = Array.isArray(responses) ? responses : [responses];
        return responses;
    };

    const updateStatesWithHandlerRes = (i: number, results: Item[], more?: boolean) => {
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
    };
    const attachMenuItems = async (resultIndex?: number) => {
        if (attachLoading.value) return;

        attachLoading.value = true;

        const responses = await getHandlerResponses(resultIndex);

        if (resultIndex === undefined) {
            responses.forEach(({ results, more }, i) => {
                updateStatesWithHandlerRes(i, results, more);
            });
        } else {
            updateStatesWithHandlerRes(resultIndex, responses[resultIndex]?.results ?? [], responses[resultIndex]?.more);
        }

        attachLoading.value = false;
    };

    return {
        attachedMenu,
        attachLoading: computed(() => attachLoading.value),
        resetMenuAndPagination,
        attachMenuItems,
    };
};
