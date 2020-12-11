/* eslint-disable camelcase */
import { QueryHelper } from '@/lib/query';
import { Query } from './type';

class ApiQueryHelper extends QueryHelper {
    private _data: Query = {};

    private _keywords: Array<string> = [];


    get data(): Query {
        if (this._keywords !== []) {
            this._data.keyword = this._keywords.join(' ');
        }

        const { filter, keyword } = this.apiQuery;
        this._data.keyword += keyword;
        this._data.filter = filter;

        return this._data;
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
