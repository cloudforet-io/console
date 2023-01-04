import type { KeyItemSet, QueryItem, ValueHandlerMap } from '@/inputs/search/query-search/type';

export interface FilterableQueryDropdownProps {
    value: string;
    placeholder: string;
    focused: boolean;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    selected: QueryItem[];
    multiSelectable: boolean;
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
}
