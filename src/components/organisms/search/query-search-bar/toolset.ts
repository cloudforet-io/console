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

    public args:Ref<any[]>;

    constructor(
        public ACHandlerClass:typeof baseAutocompleteHandler,
        acHandlerArgs:object = {},
        public argsOrder:string[] = [],
        tags:Ref<any[]> = ref([]),
        checkDuplicate:boolean = true,
        eventBus?:any,
        eventName?:string,
        changeTagCallBack?:any,
    ) {
        super(tags, checkDuplicate, eventBus, eventName, changeTagCallBack);
        this.acHandlerArgs = reactive({ ...acHandlerArgs });
        // @ts-ignore
        this.args = computed(() => this.argsOrder.map(key => this.acHandlerArgs[key]));
        this.acHandler = computed(() => {
            console.log('args',this.args.value);
            console.log('result',this.acHandlerArgs);
            // @ts-ignore
            return new this.ACHandlerClass(...this.args.value);
        });
    }
}
