import { reactive, ref, Ref } from '@vue/composition-api';
import { TagToolSet } from '@/components/molecules/tags/toolset';
import { baseAutocompleteHandler } from './autocompleteHandler';


interface QuerySearchState {
    searchText:string;
}

export class QuerySearchToolSet extends TagToolSet {
    public state:QuerySearchState = reactive({ searchText: '' });

    constructor(
        public acHandler: Ref<baseAutocompleteHandler>,
        tags:Ref<any[]> = ref([]),
        checkDuplicate:boolean = true,
        eventBus?:any,
        eventName?:string,
        changeTagCallBack?:any,
    ) {
        super(tags, checkDuplicate, eventBus, eventName, changeTagCallBack);
    }
}
