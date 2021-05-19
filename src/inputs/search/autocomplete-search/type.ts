import { MenuItem } from '@/inputs/context-menu/type';
import { SearchEventArgs } from '@/inputs/search/search/type';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
}
export type AutocompleteHandler = (inputText: string, list: MenuItem[]) => Promise<HandlerRes>|HandlerRes
