import { FilterItem } from '@/lib/fluent-api/type';
import { CONTEXT_MENU_TYPE, MenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';

export interface SearchQueryType {
    key: string;
    operator: string;
    value: any;
}

export type AutoCompleteData = [string, Array<MenuItem|string>]|[];
export type ACFunction = (contextType: CONTEXT_MENU_TYPE, inputText: string, searchQuery: FilterItem) => AutoCompleteData|Promise<AutoCompleteData>

export interface ACHandlerMap {
    key: ACFunction[];
    value: ACFunction[];
}
