import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import { TagToolSet } from '@/components/molecules/tags/PTag.toolset';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/type';
import { QueryItem } from '@/components/organisms/search/query-search/PQuerySearch.toolset';
import { OperatorType } from '@/lib/fluent-api';
import { BaseAutocompleteHandler } from './autocompleteHandler';


interface QuerySearchState {
    searchText: string;
}

export class QuerySearchToolSet extends TagToolSet {
    state: QuerySearchState = reactive({ searchText: '' });

    acHandler: Ref<BaseAutocompleteHandler>;

    acHandlerArgs: any;

    constructor(
        public ACHandlerClass: typeof BaseAutocompleteHandler,
        acHandlerArgs: object = {},
        tags: Ref<any[]> = ref([]),
        checkDuplicate = true,
        changeTagCallBack?: any,
    ) {
        super(tags, checkDuplicate, changeTagCallBack);
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
export const makeSearchQuery = (text: string): QueryItem => {
    const data = parseTag(text);
    return { key: { label: data.key, name: data.key }, operator: data.operator as OperatorType, value: data.value };
};
export const makeSearchText = (key: string, operator = '', value: any) => `${key}:${operator}${value}`;
