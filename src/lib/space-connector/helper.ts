/* eslint-disable camelcase */
import { QueryHelper } from '@/lib/query';
import { Filter, Query } from './type';

class ApiQueryHelper extends QueryHelper {
    private _data: Query = {};


    get data(): Query {
        const { filter, keyword } = this.apiQuery;

        if (filter.length > 0) this._data.filter = filter;
        else delete this._data.filter;

        if (keyword) this._data.keyword = keyword;
        else delete this._data.keyword;

        return { ...this._data };
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

    setSort(key: string, desc = false): ApiQueryHelper {
        this._data.sort = {
            key,
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
}

export {
    ApiQueryHelper,
};
