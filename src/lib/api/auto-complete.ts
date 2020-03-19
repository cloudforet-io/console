import {
    baseAutocompleteHandler,
    getKeys,
    getSuggest,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';

type AutoCompleteData = [string, any[]];
type ACFunction = () => AutoCompleteData

interface ACHandlerMap {
    key: ACFunction[];
    value: ACFunction[];

}

export interface QSTableACHandlerArgs {
    keys: string[];
    suggestKeys: string[];
}

export class QuerySearchTableACHandler extends baseAutocompleteHandler {
    constructor(args: QSTableACHandlerArgs = { keys: [], suggestKeys: [] }) {
        super();
        this.handlerMap = {
            key: [getKeys(args.keys) as ACFunction, getSuggest(args.suggestKeys) as ACFunction],
            value: [],
        };
    }
}
