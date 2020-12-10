/* eslint-disable camelcase */
import { QueryHelper } from '@/lib/query';
import { Query, Filter } from './type';

class ApiQueryHelper extends QueryHelper {
    private _data: Query = {};

    private _keywords: Array<string> = [];


    get data(): Query {
        if (this._keywords !== []) {
            this._data.keyword = this._keywords.join(' ');
        }

        const { filter, keyword } = this.apiQuery;
        if (keyword) this._data.keyword += keyword;
        if (filter.length > 0) this._data.filter = filter;

        return this._data;
    }

    addApiFilter(...filters: Array<Filter>): ApiQueryHelper {
        if (!this._data.filter) {
            this._data.filter = [];
        }

        this._data.filter.concat(filters);
        return this;
    }

    setApiFilter(...filters: Array<Filter>): ApiQueryHelper {
        this._data.filter = filters;
        return this;
    }


    addApiFilterOr(...filters: Array<Filter>): ApiQueryHelper {
        if (!this._data.filter_or) {
            this._data.filter_or = [];
        }

        this._data.filter_or.concat(filters);
        return this;
    }

    setApiFilterOr(...filters: Array<Filter>): ApiQueryHelper {
        this._data.filter_or = filters;
        return this;
    }

    setPage(start: number, limit: number): ApiQueryHelper {
        this._data.page = {
            start,
            limit,
        };
        return this;
    }

    setPageStart(start: number): ApiQueryHelper {
        if (!this._data.page) {
            this._data.page = {};
        }

        this._data.page.start = start;
        return this;
    }


    setPageLimit(limit: number): ApiQueryHelper {
        if (!this._data.page) {
            this._data.page = {};
        }

        this._data.page.limit = limit;
        return this;
    }

    setSort(key: string, desc = false, field: 'key' | 'name' = 'key'): ApiQueryHelper {
        this._data.sort = {
            [field]: key,
            desc,
        };
        return this;
    }

    setMinimal(): ApiQueryHelper {
        this._data.minimal = true;
        return this;
    }

    setCountOnly(): ApiQueryHelper {
        this._data.count_only = true;
        return this;
    }

    setOnly(...keys: Array<string>): ApiQueryHelper {
        this._data.only = keys;
        return this;
    }

    addKeyword(key: string): ApiQueryHelper {
        this._keywords.push(key);
        return this;
    }

    setKeyword(...keys: Array<string>): ApiQueryHelper {
        this._keywords = keys;
        return this;
    }
}

export {
    ApiQueryHelper,
};
