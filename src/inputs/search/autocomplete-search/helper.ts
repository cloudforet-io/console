import Fuse from 'fuse.js';
import { MenuItem } from '@/inputs/context-menu/type';
import { AutocompleteHandler } from '@/inputs/search/autocomplete-search/type';

export const plainAutocompleteHandler: AutocompleteHandler = (inputText: string, list: MenuItem[]) => {
    let results = list.filter(d => d.type === 'item');
    const trimmed = inputText.trim();
    if (trimmed) {
        const options = { keys: ['label'] };
        const fuse = new Fuse(list, options);
        results = fuse.search(trimmed);
    }
    return { results, totalCount: results.length };
};
