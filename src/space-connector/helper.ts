import { QueryHelper } from '@src/query';
import { Query } from '@src/space-connector/type';

class ApiQueryHelper extends QueryHelper {
    private _data: Query = {};

    get data(): Query {
        const { filter, keyword, filterOr } = this.apiQuery;

        if (filter.length > 0) this._data.filter = filter;
        else delete this._data.filter;

        if (filterOr.length > 0) this._data.filter_or = filterOr;
        else delete this._data.filter_or;

        if (keyword) this._data.keyword = keyword;
        else delete this._data.keyword;

        return { ...this._data };
    }

    setPage(start: number, limit: number): ApiQueryHelper {
        this._data.page = {
            start,
            limit
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
            desc
        };
        return this;
    }

    setSortKey(key: string): ApiQueryHelper {
        if (!this._data.sort) {
            this._data.sort = {
                desc: false
            };
        }

        this._data.sort.key = key;
        return this;
    }

    setSortDesc(desc = false): ApiQueryHelper {
        if (!this._data.sort) {
            this._data.sort = {};
        }

        this._data.sort.desc = desc;
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
    ApiQueryHelper
};
