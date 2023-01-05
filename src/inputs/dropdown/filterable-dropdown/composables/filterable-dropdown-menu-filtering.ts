import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { AutocompleteHandler, FilterableDropdownMenuItem } from '@/inputs/dropdown/filterable-dropdown/type';

interface UseFilterableDropdownMenuFilteringOptions {
    searchText: Ref<string>;
    disableHandler: Ref<boolean|undefined>;
    handler: Ref<AutocompleteHandler|undefined>;
    menu: Ref<FilterableDropdownMenuItem[]>;
    pageSize: Ref<number|undefined>
}
export const useFilterableDropdownMenuFiltering = ({
    searchText, disableHandler, handler, menu, pageSize,
}: UseFilterableDropdownMenuFilteringOptions) => {
    const handlerLoading = ref<boolean>(false);

    // default handler case only
    const filteredItems = ref<FilterableDropdownMenuItem[]>([]);
    const menuItemsByDefaultHandler = computed<FilterableDropdownMenuItem[]>(() => {
        if (!pageSize.value) return filteredItems.value;

        if (filteredItems.value.length > pageLimit.value) {
            const sliced = filteredItems.value.slice(0, pageLimit.value);
            return [
                ...sliced,
                { type: 'showMore', name: 'filterableDropdownShowMore' },
            ] as FilterableDropdownMenuItem[];
        }
        return filteredItems.value;
    });

    // custom handler case only
    const accumulatedItemsByCustomHandler = ref<FilterableDropdownMenuItem[]>([]);
    const hasNextItemsByCustomHandler = ref<boolean>(false);
    const menuItemsByCustomHandler = computed<FilterableDropdownMenuItem[]>(() => {
        if (hasNextItemsByCustomHandler.value) {
            return [
                ...accumulatedItemsByCustomHandler.value,
                { type: 'showMore', name: 'filterableDropdownShowMore' },
            ] as FilterableDropdownMenuItem[];
        }
        return accumulatedItemsByCustomHandler.value;
    });

    // pagination
    const pageNumber = ref<number>(0);
    const pageStart = computed(() => (pageNumber.value) * (pageSize.value ?? 0) + 1);
    const pageLimit = computed(() => (pageNumber.value + 1) * (pageSize.value ?? 0));

    // actual display menu items
    const displayMenuItems = computed<FilterableDropdownMenuItem[]>(() => {
        if (disableHandler.value) return menu.value;
        // custom handler case
        if (handler.value) {
            return menuItemsByCustomHandler.value;
        }
        // default handler case
        return menuItemsByDefaultHandler.value;
    });

    const resetMenu = () => {
        if (disableHandler.value) return;
        if (handler.value) {
            accumulatedItemsByCustomHandler.value = [];
            hasNextItemsByCustomHandler.value = false;
        } else filteredItems.value = [];
    };
    const resetPagination = () => {
        pageNumber.value = 0;
    };

    const defaultHandler = () => {
        let results: FilterableDropdownMenuItem[];
        const trimmed = searchText.value.trim();
        if (trimmed) {
            const regex = new RegExp(trimmed, 'i');
            results = menu.value.filter((d) => {
                if (d.type === undefined || d.type === 'item') return regex.test(d.label as string);
                return true;
            });
        } else {
            results = menu.value;
        }
        filteredItems.value = results;
    };
    const customHandler = async (val: string, start: number, limit: number): Promise<{ results: FilterableDropdownMenuItem[], more: boolean }> => {
        if (!handler.value) return { results: [], more: false };
        let res = handler.value(val, start, limit);
        if (res instanceof Promise) res = await res;
        return { results: res.results, more: !!res.more };
    };

    const filterMenu = async () => {
        if (disableHandler.value) return;
        handlerLoading.value = true;
        resetPagination();
        if (handler.value) {
            const { results, more } = await customHandler(searchText.value, pageStart.value, pageLimit.value);
            hasNextItemsByCustomHandler.value = more;
            accumulatedItemsByCustomHandler.value = results;
        } else {
            defaultHandler();
        }
        handlerLoading.value = false;
    };

    const attachMoreItems = async () => {
        pageNumber.value += 1;
        if (!disableHandler.value && handler.value) {
            handlerLoading.value = true;
            const { results, more } = await customHandler(searchText.value, pageStart.value, pageLimit.value);
            hasNextItemsByCustomHandler.value = more;
            accumulatedItemsByCustomHandler.value = accumulatedItemsByCustomHandler.value.concat(results);
            handlerLoading.value = false;
        }
    };

    return {
        handlerLoading,
        displayMenuItems,
        resetMenu,
        filterMenu,
        attachMoreItems,
    };
};
