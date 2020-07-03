import {
    BaseAutocompleteHandler,
    getKeys,
    getSuggest,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { ACFunction } from '@/components/organisms/search/query-search-bar/type';


export interface QSTableACHandlerArgs {
    keys: string[];
    suggestKeys: string[];
}

export class QuerySearchTableACHandler extends BaseAutocompleteHandler {
    constructor(args: QSTableACHandlerArgs = { keys: [], suggestKeys: [] }) {
        super();
        this.HandlerMap = {
            key: [getKeys(args.keys) as ACFunction, getSuggest(args.suggestKeys) as ACFunction],
            value: [],
        };
    }
}
