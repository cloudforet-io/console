/* eslint-disable camelcase */
import { QueryHelper } from '@/lib/query';
import { Filter, Query } from './type';

class ApiQueryHelper extends QueryHelper {
    private _data: Query = {};

    private _keywords: Array<string> = [];

    get data(): Query {
        const { filter, keyword } = this.apiQuery;

        if (filter.length > 0) {
            if (this._data.filter) {
                this._data.filter.concat(filter);
            } else {
                this._data.filter = filter;
            }
        }
        if (keyword) {
            if (this._keywords.length > 0) {
                this._data.keyword = `${this._keywords.join(' ')} ${keyword}`;
            } else {
                this._data.keyword = keyword;
            }
        }

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

    setApiFilter(...filter: Filter[]): ApiQueryHelper {
        this.data.filter = filter;
        return this;
    }

    addApiFilter(...filter: Filter[]): ApiQueryHelper {
        if (!this.data.filter) {
            this.data.filter = filter;
        } else {
            this.data.filter.push(...filter);
        }
        return this;
    }
}

export {
    ApiQueryHelper,
};
