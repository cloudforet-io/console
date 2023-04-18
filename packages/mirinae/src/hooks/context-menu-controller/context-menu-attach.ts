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
    attachHandler?: Ref<MenuAttachHandler|undefined>; // custom handler
    menu?: Ref<MenuItem[]>;
    searchText?: Ref<string>;
    pageSize?: Ref<number|undefined>|number;
    filterItems?: Ref<MenuItem[]>;
}

export const useContextMenuAttach = ({
    attachHandler, menu, searchText, pageSize: _pageSize, filterItems,
}: UseContextMenuAttachOptions) => {
    const accumulatedItemsByAttachHandler = ref<MenuItem[]>([]);
    const hasNextItemsByAttachHandler = ref<boolean>(false);
    const attachedMenu = computed<MenuItem[]>(() => {
        if (hasNextItemsByAttachHandler.value) {
            return [
                ...accumulatedItemsByAttachHandler.value,
                { type: 'showMore', name: 'filterableDropdownShowMore' },
            ] as MenuItem[];
        }
        return accumulatedItemsByAttachHandler.value;
    });

    // pagination
    const pageNumber = ref<number>(0);
    const pageSize = isRef(_pageSize) ? _pageSize : ref(_pageSize);
    const pageStart = computed(() => (pageNumber.value) * (pageSize?.value ?? 0) + 1);
    const pageLimit = computed(() => (pageNumber.value + 1) * (pageSize?.value ?? 0));

    const resetMenuAndPagination = () => {
        accumulatedItemsByAttachHandler.value = [];
        hasNextItemsByAttachHandler.value = false;
        pageNumber.value = 0;
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
    const attachMenuItems = async () => {
        if (attachLoading.value) {
            return [];
        }
        attachLoading.value = true;
        const handler = attachHandler?.value ?? defaultAttachHandler;
        const { results, more } = await handler(searchText?.value ?? '', pageStart.value, pageLimit.value);

        hasNextItemsByAttachHandler.value = !!more;
        let refined = results;
        if (filterItems) {
            refined = results.filter((item) => !item.name || !filterItemsMap.value[item.name]);
        }

        if (pageNumber.value === 0) {
            accumulatedItemsByAttachHandler.value = refined;
        } else {
            accumulatedItemsByAttachHandler.value = accumulatedItemsByAttachHandler.value.concat(refined);
        }

        attachLoading.value = false;
        pageNumber.value += 1; // increase page number for next handler's arguments - page start, page limit

        return refined;
    };

    return {
        attachedMenu,
        attachLoading: computed(() => attachLoading.value),
        resetMenuAndPagination,
        attachMenuItems,
    };
};
