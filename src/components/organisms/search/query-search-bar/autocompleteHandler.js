import Fuse from 'fuse.js';
import { isRef } from '@vue/composition-api';

export class SearchQuery {
    constructor(key, operator, value) {
        this.key = key;
        this.operator = operator;
        this.value = value;
    }
}

export const searchContextType = Object.freeze({
    Key: Symbol('Key'),
    Value: Symbol('Value'),
    None: Symbol('None'),
});

// todo: TS 도입시 인터페이스로 대체
export class baseAutocompleteHandler {
    constructor() {
        this.handlerMap = {
            key: [],
            value: [],
        };
    }

    async getAutoCompleteData(contextType, inputText, searchQuery) {
        const result = [];
        let handlers = [];
        // const txt = isRef(inputText) ? inputText.value : inputText;
        if (contextType === searchContextType.Key) {
            handlers = this.handlerMap.key;
        } else if (contextType === searchContextType.Value) {
            handlers = this.handlerMap.value;
        }
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            // eslint-disable-next-line no-await-in-loop
            result.push(...this.makeContextMenu(await handler(contextType, inputText, searchQuery)));
        }
        if (_.head(result).type === 'divider') {
            return result.slice(1);
        }
        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    makeItem(value) {
        return { type: 'item', label: value, name: value };
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
    return [prefix, [`${prefix} ${searchQuery.value}`]];
};
export const getKeys = (rawKeys) => {
    const keys = _.flatMap(rawKeys, value => (`${value}:`));
    const data = _.flatMap(keys, value => ({ key: value }));
    const fuse = new Fuse(data, { keys: ['key'], id: 'key' });
    return (contextType, inputText) => {
        let result = keys;
        if (inputText) {
            result = fuse.search(inputText);
        }
        return ['Keys', result];
    };
};
export const getSuggest = suggestKeys => (contextType, inputText) => {
    const result = [];
    suggestKeys.forEach((key) => { result.push(`${key}:${inputText}`); });
    return ['Suggest', result];
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

    constructor() {
        super();
        this.handlerMap = {
            key: [getKeys(this.keys), getSuggest(this.suggestKeys)],
            value: [getValues],
        };
    }
}
