import Fuse from 'fuse.js';
import _ from 'lodash';
import { autoCompleteQuery } from '@/lib/api';

export interface SearchQueryType {
    key: string,
    operator: string,
    value: any;
}

export class SearchQuery implements SearchQueryType {
    constructor(public key, public operator, public value) { }
}

export const searchContextType = Object.freeze({
    Key: Symbol('Key'),
    Value: Symbol('Value'),
    None: Symbol('None'),
});

interface handlerMap {
    key:any[];
    value:any[];
}

// todo: TS 도입시 인터페이스로 대체
export class baseAutocompleteHandler {
    public handlerMap:handlerMap;

    constructor(args?:any) {
        this.handlerMap = {
            key: [],
            value: [],
        };
    }

    async getAutoCompleteData(contextType, inputText, searchQuery) {
        const result:any[] = [];
        let handlers:any[] = [];
        // const txt = isRef(inputText) ? inputText.value : inputText;
        if (contextType === searchContextType.Key) {
            handlers = this.handlerMap.key;
        } else if (contextType === searchContextType.Value) {
            handlers = this.handlerMap.value;
        }
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            // eslint-disable-next-line no-await-in-loop
            result.push(...this.makeContextMenu(await handler(contextType, inputText, searchQuery)));
        }
        if (result.length >= 1 && _.head(result).type === 'divider') {
            return result.slice(1);
        }
        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    makeItem(value) {
        return typeof value === 'object' ? value : { type: 'item', label: value, name: value };
    }

    makeContextMenu(data) {
        let result = [{ type: 'divider' }];
        const title = data[0] ? [{ type: 'header', label: data[0] }] : [];
        result = result.concat(title);
        const menus = data[1];
        if (menus && menus.length >= 1) {
            const menuItems = _.flatMap(menus, this.makeItem);
            return result.concat(menuItems);
        }
        return [];
    }
}

export const getValues = (contextType, inputText, searchQuery) => {
    const prefix = `${searchQuery.key}:${searchQuery.operator}`;
    return [searchQuery.key, [`${prefix} ${searchQuery.value}`]];
};

export const getEnumValues = (key, values) => (contextType, inputText, searchQuery) => {
    if (searchQuery.key === key) {
        const prefix = `${searchQuery.key}:${searchQuery.operator}`;
        return [
            searchQuery.key,
            _.flatMap(values, v => `${prefix} ${v}`),
        ];
    }
    return [];
};

export const getSearchEnumValues = (key, values, defaultValues = [], fuseOptions = {}) => {
    const searchValues = _.flatMap(values, value => ({ label: value }));
    const fuse = new Fuse(searchValues, {
        ...fuseOptions,
        keys: ['label'],
        shouldSort: true,
    });
    return (contextType, inputText, searchQuery) => {
        if (searchQuery.key === key) {
            const prefix = `${searchQuery.key}:${searchQuery.operator}`;
            if (searchQuery.value) {
                const result = fuse.search(searchQuery.value);
                return [
                    searchQuery.key,
                    _.flatMap(result, v => `${prefix} ${v.label}`),
                ];
            }
            return defaultValues.length ? [searchQuery.key, _.flatMap(defaultValues, v => `${prefix} ${v}`),
            ] : [];
        }
        return [];
    };
};


export const getKeys = (rawKeys) => {
    const keys = _.flatMap(rawKeys, value => ({ type: 'item', label: value, name: `${value}:` }));
    const fuse = new Fuse(keys, { keys: ['label'] });
    return (contextType, inputText) => {
        let result = keys;
        if (inputText) {
            result = fuse.search(inputText);
        }
        return ['Keys', result];
    };
};
export const getSuggest = suggestKeys => (contextType, inputText) => {
    const result:string[] = [];
    suggestKeys.forEach((key) => { result.push(`${key}:${inputText}`); });
    return ['Suggest', result];
};

/**
 * @description Value list fetch
 * @param key
 * @param urlPath
 * @param parent
 * @param limit
 * @param matchKey
 * @returns {function(...[*]=)}
 */
export const getFetchValues = (key:string, urlPath:string, parent:any, limit:number = 10, matchKey?:string) => async (contextType, inputText, searchQuery) => {
    if (searchQuery.key === key) {
        const realKey = matchKey || searchQuery.key;
        const res = await parent.$http.post(urlPath, {
            query: autoCompleteQuery({ ...searchQuery, key: realKey }, limit),
        });

        const prefix = `${searchQuery.key}:${searchQuery.operator}`;
        return [
            `${searchQuery.key}(total: ${res.data.total_count})`,
            _.flatMap(res.data.results, item => `${prefix} ${_.get(item, realKey)}`),
        ];
    }
    return [];
};

/**
 * @param parent
 * @param valuesFetchUrl
 * @param valuesFetchKeys
 * @returns {Array|*[]}
 */
export const makeValuesFetchHandler = (parent:any, valuesFetchUrl:string, valuesFetchKeys:string[]) => {
    if (parent && valuesFetchUrl && valuesFetchKeys.length > 0) {
        return _.flatMap(valuesFetchKeys, key => getFetchValues(key, valuesFetchUrl, parent));
    }
    return [];
};

export class defaultAutocompleteHandler extends baseAutocompleteHandler {
    // eslint-disable-next-line class-methods-use-this
    get keys() {
        return [];
    }

    // eslint-disable-next-line class-methods-use-this
    get suggestKeys() {
        return [];
    }

    // todo: api 요청용 클라이언트를 import 방식으로 가져오게 변경하기 - sinsky
    // eslint-disable-next-line class-methods-use-this
    get parent() {
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    get valuesFetchUrl() {
        return '';
    }

    // eslint-disable-next-line class-methods-use-this
    get valuesFetchKeys() {
        return [];
    }

    constructor() {
        super();
        this.handlerMap = {
            key: [getKeys(this.keys), getSuggest(this.suggestKeys)],
            // todo: 개별 키 자동 완성은 object방식으로 처리 하고 키와 무관한 자동완성은 array에서 가져와 처리하여 처리 속도 최적화 하기 - sinsky
            value: [...makeValuesFetchHandler(this.parent, this.valuesFetchUrl, this.valuesFetchKeys)],
        };
    }
}
