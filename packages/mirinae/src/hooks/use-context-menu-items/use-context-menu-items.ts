import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import {
    computed, isRef, reactive, ref, toRef,
} from 'vue';

import { isEmpty } from 'lodash';

import type { MenuItem } from '@/controls/context-menu/type';
import { getTextHighlightRegex } from '@/utils/helpers';

import type { UseContextMenuAttachOptions } from '../use-context-menu-attach/use-context-menu-attach';
import { useContextMenuAttach } from '../use-context-menu-attach/use-context-menu-attach';

export interface UseContextMenuItemsOptions<Item extends MenuItem = MenuItem> extends
    Omit<UseContextMenuAttachOptions<Item>, 'attachHandler'|'filterItems'> {
    useReorderBySelection?: boolean; // Whether to automatically reorder on initiateMenu().
    selected?: Ref<Item[]>|ComputedRef<Item[]>|Item[]; // Items to be displayed at the top of the menu for emphasize or quick access of selected items.
    useMenuFiltering?: boolean; // Whether to automatically filtering menu by searchText. works only with menu, not with handler.
    hideHeaderWithoutItems?: Ref<boolean|undefined>|boolean;
    handler?: UseContextMenuAttachOptions<Item>['attachHandler'];
}

interface UseContextMenuItemsReturns<Item extends MenuItem = MenuItem> {
    refinedMenu: ComputedRef<Item[]>;
    loading: Ref<boolean>;
    initiateMenu: () => Promise<void>; // reset pagination, capture current items, and reattach menu items.
    reloadMenu: () => Promise<void>; // reset pagination and reattach menu items.
    showMoreMenu: (resultIndex?: number) => Promise<void>; // attach more menu items.
}


export const useContextMenuItems = <Item extends MenuItem = MenuItem>({
    useReorderBySelection, menu, selected,
    useMenuFiltering, searchText, handler, pageSize, hideHeaderWithoutItems,
}: UseContextMenuItemsOptions<Item>): UseContextMenuItemsReturns<Item> => {
    /* options validation */
    if (useReorderBySelection) {
        if (!menu && (!handler || (isRef(handler) && !handler.value))) {
            throw new Error('If \'useReorderBySelection\' is \'true\', \'menu\' or \'handler\' option must be given.');
        }
        if (!selected) {
            throw new Error('If \'useReorderBySelection\' is \'true\', \'selected\' option must be given.');
        }
    }
    if (useMenuFiltering) {
        if (!menu && (!handler || (isRef(handler) && !handler.value))) {
            throw new Error('If \'useMenuFiltering\' is \'true\', \'menu\' or \'handler\' option must be given.');
        }
        if (!searchText) {
            throw new Error('If \'useMenuFiltering\' is \'true\', \'searchText\' option must be given.');
        }
    }

    const state = reactive({
        menu: menu ?? [] as Item[],
        selected: selected ?? [] as Item[],
        pageSize,
        searchText: searchText ?? '',
        hideHeaderWithoutItems,
    });


    // menu filtering
    const filterItemsBySearchText = (text: string, items: Item[]) => {
        let results: Item[];
        const trimmed = text.trim();
        if (trimmed) {
            const regex = getTextHighlightRegex(trimmed);
            results = items.filter((d) => {
                if (d.type === undefined || d.type === 'item') return regex.test(d.label as string);
                return true;
            });
        } else {
            results = [...items];
        }

        return results;
    };

    /* menu capturing */
    const selectedSnapshot = ref<Item[]>([]);
    const capture = () => {
        selectedSnapshot.value = [...state.selected] as UnwrapRef<Item[]>;
    };

    /* menu attaching */
    const defaultMenu = useMenuFiltering ? computed<Item[]>(() => filterItemsBySearchText(state.searchText, state.menu as Item[])) : toRef(state, 'menu');
    const {
        attachedMenu,
        attachLoading,
        resetMenuAndPagination: resetAttachedMenuAndPagination,
        attachMenuItems,
    } = useContextMenuAttach<Item>({
        attachHandler: handler,
        menu: defaultMenu as Ref<Item[]>,
        searchText,
        pageSize: toRef(state, 'pageSize'),
        filterItems: useReorderBySelection ? selectedSnapshot as Ref<Item[]> : undefined,
    });

    /* menu refining */
    const SELECTION_DIVIDER_KEY = 'selection-divider';
    const topItems = computed<Item[]>(() => {
        const filtered = filterItemsBySearchText(state.searchText, selectedSnapshot.value as Item[]);

        // group by headerName
        const headerNameItemsMap = getHeaderNameItemsMap<Item>(filtered, attachedMenu.value);
        if (isEmpty(headerNameItemsMap)) return filtered;

        // reorder items by headerName and add divider
        let reordered: Item[] = [];
        const entries = Object.entries<HeaderIndicesTuple<Item>>(headerNameItemsMap);
        const allIndices: number[] = [];
        entries.forEach(([, [header, indices]], i) => {
            reordered.push(header);
            indices.forEach((idx) => {
                reordered.push(filtered[idx]);
                allIndices.push(idx);
            });
            if (i < entries.length - 1) {
                reordered.push({ type: 'divider', name: `selection-${header.name}-divider` } as Item);
            }
        });
        const restItems = filtered.filter((_, idx) => !allIndices.includes(idx));
        if (restItems.length) {
            reordered.push({ type: 'divider', name: 'selection-rest-divider' } as Item);
            reordered = reordered.concat(restItems);
        }
        reordered = reordered.concat();
        return reordered;
    });
    const refinedMenu = computed(() => {
        if (!useReorderBySelection) return attachedMenu.value;

        let newItems: Item[] = [];
        if (topItems.value.length) {
            newItems = newItems.concat(topItems.value);
            newItems.push({ type: 'divider', name: SELECTION_DIVIDER_KEY } as Item);

            let restItems: Item[];
            if (state.hideHeaderWithoutItems) {
                restItems = [];
                const headerNameItemsMap = getHeaderNameItemsMap<Item>(attachedMenu.value, attachedMenu.value);
                restItems = attachedMenu.value.filter((d) => {
                    if (d.type === 'header') {
                        return !!headerNameItemsMap[d.name as string]?.[1]?.length;
                    }
                    return true;
                });
            } else {
                restItems = attachedMenu.value;
            }

            newItems = newItems.concat(restItems);
        } else {
            newItems = attachedMenu.value;
        }
        return newItems;
    });

    /* initiate or reload menu */
    const initiateMenu = async () => {
        resetAttachedMenuAndPagination();
        capture();
        await attachMenuItems();
    };
    const reloadMenu = async () => {
        resetAttachedMenuAndPagination();
        await attachMenuItems();
    };

    return {
        refinedMenu,
        loading: attachLoading,
        initiateMenu,
        reloadMenu,
        showMoreMenu: attachMenuItems,
    };
};

type HeaderIndicesTuple<Item> = [header: Item, itemIndices: number[]];
const getHeaderNameItemsMap = <Item extends MenuItem>(targetItems: Item[], allItems: Item[]): Record<string, HeaderIndicesTuple<Item>> => {
    const headerNameItemsMap: Record<string, HeaderIndicesTuple<Item>> = {};
    targetItems.forEach((item, index) => {
        if (!item.headerName) return;
        if (headerNameItemsMap[item.headerName]) {
            headerNameItemsMap[item.headerName][1].push(index);
        } else {
            const header = allItems.find((d) => d.type === 'header' && d.name === item.headerName);
            if (!header) return;
            headerNameItemsMap[item.headerName] = [header, [index]];
        }
    });
    return headerNameItemsMap;
};
