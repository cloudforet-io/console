import Fuse from 'fuse.js';
import _ from 'lodash';
import { autoCompleteQuery, setActionByQuery } from '@/lib/api/query';
import { FilterItem } from '@/lib/fluent-api/type';
import {
    SearchQueryType,
    ACHandlerMap,
    ACFunction,
    AutoCompleteData,
} from '@/components/organisms/search/query-search-bar/type';
import { CONTEXT_MENU_TYPE, MenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import { StatQueryAPI } from '@/lib/fluent-api/statistics/toolset';
import { ListAction, QueryAPI } from '@/lib/fluent-api/toolset';

export class SearchQuery implements SearchQueryType {
    constructor(public key, public operator, public value) { }
}

export const SEARCH_PREFIX = 'Search';

export const setFilterOrWithSuggestKeys = (query: FilterItem, suggestKeys: string[], filterOr: FilterItem[]): void => {
    suggestKeys.forEach((key) => {
        filterOr.push({ ...query, key });
    });
};

export const searchContextType = Object.freeze({
    Key: Symbol('Key'),
    Value: Symbol('Value'),
    None: Symbol('None'),
});

// todo: TS 도입시 인터페이스로 대체
export class BaseAutocompleteHandler {
    HandlerMap: ACHandlerMap;

    constructor(args?: any) {
        this.HandlerMap = {
            key: [],
            value: [],
        };
    }

    async getAutoCompleteData(contextType, inputText, searchQuery) {
        const result: any[] = [];
        let handlers: ACFunction[] = [];
        // const txt = isRef(inputText) ? inputText.value : inputText;
        if (contextType === searchContextType.Key) {
            handlers = this.HandlerMap.key;
        } else if (contextType === searchContextType.Value) {
            handlers = this.HandlerMap.value;
        }
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            // eslint-disable-next-line no-await-in-loop
            result.push(...this.makeContextMenu(await handler(contextType, inputText, searchQuery)));
        }
        if (result.length >= 1 && _.head(result).type === CONTEXT_MENU_TYPE.divider) {
            return result.slice(1);
        }
        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    makeItem(value: string|MenuItem): MenuItem {
        return typeof value === 'object' ? value : { type: CONTEXT_MENU_TYPE.item, label: value, name: value };
    }

    makeContextMenu(data: AutoCompleteData): MenuItem[] {
        let result = [{ type: CONTEXT_MENU_TYPE.divider }] as MenuItem[];
        const title = data[0] ? [{ type: CONTEXT_MENU_TYPE.header, label: data[0] }] : [];
        result = result.concat(title);
        const menus = data[1];
        if (menus && menus.length >= 1) {
            const menuItems = _.flatMap(menus, this.makeItem) as MenuItem[];
            return result.concat(menuItems);
        }
        return [];
    }
}

export const getValues = (contextType, inputText, searchQuery): AutoCompleteData => {
    const prefix = `${searchQuery.key}:${searchQuery.operator}`;
    return [searchQuery.key, [`${prefix} ${searchQuery.value}`]];
};

export const getEnumValues = (key, values): ACFunction => (contextType: CONTEXT_MENU_TYPE, inputText: string, searchQuery: FilterItem): AutoCompleteData => {
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


export const getKeys = (rawKeys): ACFunction => {
    const keys = _.flatMap(rawKeys, value => ({ type: CONTEXT_MENU_TYPE.item, label: value, name: `${value}:` }));
    const fuse = new Fuse(keys, { keys: ['label'] });
    return (contextType, inputText) => {
        let result = keys;
        if (inputText) {
            result = fuse.search(inputText);
        }
        return ['Keys', result];
    };
};
export const getSuggest = (suggestKeys): ACFunction => (contextType: CONTEXT_MENU_TYPE, inputText) => {
    const result: string[] = [];
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
export const getFetchValues = function (key: string, urlPath: string, parent: any, limit = 10, matchKey?: string): ACFunction {
    return async (contextType: CONTEXT_MENU_TYPE, inputText: string, searchQuery: FilterItem): Promise<AutoCompleteData> => {
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
};

/**
 *
 * @description Get Auto Complete Handler for values
 */
export function getValueHandler<api extends StatQueryAPI<any, any>|QueryAPI<any, any> = StatQueryAPI<any, any>>(key: string, action: api, limit = 10, matchKey?: string): ACFunction {
    return async (contextType: CONTEXT_MENU_TYPE, inputText: string, searchQuery: FilterItem): Promise<AutoCompleteData> => {
        if (searchQuery.key === key) {
            const realKey = matchKey || searchQuery.key;
            const api = setActionByQuery(action, { ...searchQuery, key: realKey }, limit);
            const res = await api.execute();


            const prefix = `${searchQuery.key}:${searchQuery.operator}`;
            return [
                `${searchQuery.key}(total: ${res.data.total_count})`,
                _.reduce(res.data.results, (items, item) => {
                    const result = typeof item === 'object' ? _.get(item, realKey) : item;
                    if (result !== '' && result !== null && result !== undefined) items.push(`${prefix} ${result}`);
                    return items;
                }, [] as string[]),
            ];
        }
        return [];
    };
}

/**
 * * @description Get Auto Complete Handler List for values
 */

export function makeValueHandlers<api extends StatQueryAPI<any, any>|QueryAPI<any, any> = StatQueryAPI<any, any>>(valuesFetchKeys: string[], action: api): ACFunction[] {
    if (valuesFetchKeys.length > 0) {
        return _.flatMap(valuesFetchKeys, key => getValueHandler(key, action));
    }
    return [];
}

/**
 * @param parent
 * @param valuesFetchUrl
 * @param valuesFetchKeys
 * @returns {Array|*[]}
 */
export const makeValuesFetchHandler = (parent: any, valuesFetchUrl: string, valuesFetchKeys: string[]): ACFunction[] => {
    if (parent && valuesFetchUrl && valuesFetchKeys.length > 0) {
        return _.flatMap(valuesFetchKeys, key => getFetchValues(key, valuesFetchUrl, parent));
    }
    return [];
};

export class DefaultAutocompleteHandler extends BaseAutocompleteHandler {
    // eslint-disable-next-line class-methods-use-this
    get keys() {
        return [] as any[];
    }

    // eslint-disable-next-line class-methods-use-this
    get suggestKeys() {
        return [] as any[];
    }

    // todo: api 요청용 클라이언트를 import 방식으로 가져오게 변경하기 - sinsky
    // eslint-disable-next-line class-methods-use-this
    get parent() {
        return null as any;
    }

    // eslint-disable-next-line class-methods-use-this
    get valuesFetchUrl() {
        return '';
    }

    // eslint-disable-next-line class-methods-use-this
    get valuesFetchKeys() {
        return [] as any[];
    }

    constructor() {
        super();
        this.HandlerMap = {
            key: [getKeys(this.keys), getSuggest(this.suggestKeys)],
            // todo: 개별 키 자동 완성은 object방식으로 처리 하고 키와 무관한 자동완성은 array에서 가져와 처리하여 처리 속도 최적화 하기 - sinsky
            value: [...makeValuesFetchHandler(this.parent, this.valuesFetchUrl, this.valuesFetchKeys)],
        };
    }
}
