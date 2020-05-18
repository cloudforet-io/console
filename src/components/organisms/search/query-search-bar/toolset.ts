import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import { TagToolSet } from '@/components/molecules/tags/toolset';
import { baseAutocompleteHandler, SearchQuery, SearchQueryType } from './autocompleteHandler';


interface QuerySearchState {
    searchText: string;
}

export class QuerySearchToolSet extends TagToolSet {
    state: QuerySearchState = reactive({ searchText: '' });

    acHandler: Ref<baseAutocompleteHandler>;

    acHandlerArgs: any;

    constructor(
        public ACHandlerClass: typeof baseAutocompleteHandler,
        acHandlerArgs: object = {},
        tags: Ref<any[]> = ref([]),
        checkDuplicate = true,
        eventBus?: any,
        eventName?: string,
        changeTagCallBack?: any,
    ) {
        super(tags, checkDuplicate, eventBus, eventName, changeTagCallBack);
        this.acHandlerArgs = reactive({ ...acHandlerArgs });
        // @ts-ignore
        this.acHandler = computed(() => new this.ACHandlerClass(this.acHandlerArgs));
    }
}

export const keyRegx = new RegExp('^(?<key>.+?):');
export const operatorRegx = new RegExp('^.+?:(?<operator>[=|<|>|!|$]=?)?');
export interface TagInfo {
 hasKey: boolean;
 key: string;
 operator: string;
 value: any;

}
export const parseTag = (text: string): TagInfo => {
    const keyParser = keyRegx.exec(text);
    const operatorParser = operatorRegx.exec(text);
    // @ts-ignore
    const key = keyParser && !!keyParser.groups.key ? keyParser.groups.key.trim() : '';
    // @ts-ignore
    const operator = operatorParser && !!operatorParser.groups.operator ? operatorParser.groups.operator.trim() : '';
    let value: null|string = null;
    if (operatorRegx.test(text)) {
        // @ts-ignore
        value = text.slice(operatorParser[0].length).trim();
    }
    return {
        hasKey: !!key,
        key,
        operator,
        value,
    };
};
export const makeSearchQuery = (text: string) => {
    const data = parseTag(text);
    return { key: data.key, operator: data.operator, value: data.value }as SearchQueryType;
};
export const makeSearchText = (key: string, operator = '', value: any) => `${key}:${operator}${value}`;
