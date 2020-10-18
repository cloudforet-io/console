import { MenuItem } from '@/components/organisms/context-menu/type';

export type AutocompleteHandler = (inputText: string) => Promise<{
    results: MenuItem[];
    totalCount: number;
}>

export interface AutocompleteSearchProps {
    placeholder: string;
    menu: MenuItem[];
    loading: boolean;
    focused: boolean;
    value: string;
    visibleMenu?: boolean;
    isFocused?: boolean;
    results: MenuItem[];
    totalCount: number;
    handler?: AutocompleteHandler;
}


