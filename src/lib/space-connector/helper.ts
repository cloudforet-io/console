/* eslint-disable camelcase */
import { Query, Filter } from './type';

class QueryHelper {
    private _data: Query = {};

    private _keywords: Array<string> = [];

    get data(): Query {
        if (this._keywords !== []) {
            this._data.keyword = this._keywords.join(' ');
        }

        return this._data;
    }

    addFilter(...filters: Array<Filter>): QueryHelper {
        if (!this._data.filter) {
            this._data.filter = [];
        }

        this._data.filter.concat(filters);
        return this;
    }

    setFilter(...filters: Array<Filter>): QueryHelper {
        this._data.filter = filters;
        return this;
    }

    addFilterOr(...filters: Array<Filter>): QueryHelper {
        if (!this._data.filter_or) {
            this._data.filter_or = [];
        }

        this._data.filter_or.concat(filters);
        return this;
    }

    setFilterOr(...filters: Array<Filter>): QueryHelper {
        this._data.filter_or = filters;
        return this;
    }

    setPage(start: number, limit: number): QueryHelper {
        this._data.page = {
            start,
            limit,
        };
        return this;
    }

    setPageStart(start: number): QueryHelper {
        if (!this._data.page) {
            this._data.page = {};
        }

        this._data.page.start = start;
        return this;
    }


    setPageLimit(limit: number): QueryHelper {
        if (!this._data.page) {
            this._data.page = {};
        }

        this._data.page.limit = limit;
        return this;
    }

    setSort(key: string, desc = false, field: 'key' | 'name' = 'key'): QueryHelper {
        this._data.sort = {
            [field]: key,
            desc,
        };
        return this;
    }

    setMinimal(): QueryHelper {
        this._data.minimal = true;
        return this;
    }

    setCountOnly(): QueryHelper {
        this._data.count_only = true;
        return this;
    }

    setOnly(...keys: Array<string>): QueryHelper {
        this._data.only = keys;
        return this;
    }

    addKeyword(key: string): QueryHelper {
        this._keywords.push(key);
        return this;
    }

    setKeyword(...keys: Array<string>): QueryHelper {
        this._keywords = keys;
        return this;
    }
}

export {
    QueryHelper,
};
