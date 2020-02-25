
import { reactive, Ref } from '@vue/composition-api';
import { ToolboxTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';
// eslint-disable-next-line import/no-cycle
import { QuerySearchToolSet } from '@/components/organisms/search/query-search-bar/toolset';
// eslint-disable-next-line import/no-cycle
import { baseAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export class QuerySearchTableToolSet extends ToolboxTableToolSet {
    public querySearch:QuerySearchToolSet;

    public acState:any

    constructor(
        ACHandlerClass:typeof baseAutocompleteHandler = baseAutocompleteHandler,
        acHandlerArgs:object = {},
        argsOrder:string[] = [],
        public initData:object = {},
        public initSyncData:object = {},
    ) {
        super(initData, initSyncData);
        this.querySearch = new QuerySearchToolSet(ACHandlerClass, acHandlerArgs, argsOrder);
    }
}
