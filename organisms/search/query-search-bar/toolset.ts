import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import { TagToolSet } from '@/components/molecules/tags/toolset';
import { baseAutocompleteHandler } from './autocompleteHandler';


interface QuerySearchState {
    searchText:string;
}

export class QuerySearchToolSet extends TagToolSet {
    public state:QuerySearchState = reactive({ searchText: '' });

    public acHandler:Ref<baseAutocompleteHandler>;

    public acHandlerArgs :any;

    constructor(
        public ACHandlerClass:typeof baseAutocompleteHandler,
        acHandlerArgs:object = {},
        tags:Ref<any[]> = ref([]),
        checkDuplicate:boolean = true,
        eventBus?:any,
        eventName?:string,
        changeTagCallBack?:any,
    ) {
        super(tags, checkDuplicate, eventBus, eventName, changeTagCallBack);
        this.acHandlerArgs = reactive({ ...acHandlerArgs });
        // @ts-ignore
        this.acHandler = computed(() => new this.ACHandlerClass(this.acHandlerArgs));
    }
}
