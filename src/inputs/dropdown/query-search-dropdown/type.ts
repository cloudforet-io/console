import type { KeyItemSet, QueryItem, ValueHandlerMap } from '@/inputs/search/query-search/type';

export interface QuerySearchDropdownProps {
    value: string;
    placeholder: string;
    focused: boolean;
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    selected: QueryItem[];
    multiSelectable: boolean;
}
