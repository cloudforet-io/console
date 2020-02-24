
import { Ref } from '@vue/composition-api';
import { ToolboxTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';
// eslint-disable-next-line import/no-cycle
import { QuerySearchToolSet } from '@/components/organisms/search/query-search-bar/toolset';
// eslint-disable-next-line import/no-cycle
import { baseAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export class QuerySearchTableToolSet extends ToolboxTableToolSet {
    public querySearch:QuerySearchToolSet;

    constructor(acHandler:Ref<baseAutocompleteHandler>, public initData:object = {}, public initSyncData:object = {}) {
        super(initData, initSyncData);
        this.querySearch = new QuerySearchToolSet(acHandler);
    }
}
