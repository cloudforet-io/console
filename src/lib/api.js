import axios from 'axios';
import VueCookies from 'vue-cookies';
import jwt from 'jsonwebtoken';
import prefixPropName from 'bootstrap-vue/esm/utils/prefix-prop-name';
import { object } from '@storybook/addon-knobs';

class APIError extends Error {
    constructor(axiosError) {
        super();

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }

        this.name = 'APIError';
        this.status = 500;
        this.code = 'ERROR_UNKNOWN';
        this.axiosError = axiosError;

        if (axiosError.response) {
            this.status = axiosError.response.status;

            if (axiosError.response.data.error) {
                this.message = axiosError.response.data.error.message;
                this.code = axiosError.response.data.error.code;
            } else {
                this.message = axiosError.response.statusText;
            }
        } else {
            this.message = axiosError.message;
        }
    }
}

class API {
    constructor() {
        this.instance = null;
    }

    getExpireTimes(accessToken) {
        const decodedToken = jwt.decode(accessToken);
        return decodedToken.exp - Math.floor(Date.now() / 1000);
    }

    createAxiosInstance(baseURL) {
        const axiosConfig = {
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        this.instance = axios.create(axiosConfig);
        const accessToken = VueCookies.get('accessToken');
        if (accessToken) {
            this.instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        }
    }

    setResponseInterceptor(handlers) {
        this.instance.interceptors.response.use((response) => {
            const accessToken = response.headers['access-token'];
            if (accessToken) {
                this.setAccessToken(accessToken);
            }
            return response;
        }, (e) => {
            const apiError = new APIError(e);

            if (apiError.status === 401) {
                if (handlers.authError) {
                    handlers.authError(apiError);
                }
            }

            return Promise.reject(apiError);
        });
    }

    setAccessToken(accessToken) {
        this.instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        const expireTimes = this.getExpireTimes(accessToken);
        VueCookies.set('accessToken', accessToken, expireTimes);
    }

    removeAccessToken() {
        if (this.instance) {
            delete this.instance.defaults.headers.common.Authorization;
        }
        VueCookies.remove('accessToken');
    }

    checkAccessToken() {
        const accessToken = VueCookies.get('accessToken');
        if (accessToken) {
            return true;
        }
        return false;
    }

    init(baseURL, handlers = {}) {
        if (!this.instance) {
            this.createAxiosInstance(baseURL);
            this.setResponseInterceptor(handlers);
        }
    }
}

export default new API();

export const operatorMap = Object.freeze({
    '': 'contain',
    '!': 'not_contain',
    '>': 'lt',
    '>=': 'lte',
    '<': 'gt',
    '<=': 'gte',
    '=': 'eq',
    '!=': 'not',
    in: 'in',
    '!in': 'not_in',
});

/**
 * @name defaultQuery
 * @description make default query format
 * @param thisPage
 * @param pageSize
 * @param sortBy
 * @param sortDesc
 * @param searchText
 * @param searchQuery
 * @returns {{page: {start: number, limit: *}}}
 */
export const defaultQuery = (thisPage, pageSize, sortBy, sortDesc, searchText, searchQuery) => {

    const query = {
        page: {
            start: ((thisPage - 1) * pageSize) + 1,
            limit: pageSize,
        },
    };
    if (sortBy) {
        query.sort = {
            key: sortBy,
            desc: sortDesc,
        };
    }
    if (searchText) {
        query.keyword = searchText || '';
    }
    if (searchQuery) {
        const filter = [];
        // eslint-disable-next-line camelcase
        const filter_or = [];
        const andQueryKeywords = new Set([]);
        searchQuery.forEach((q) => {
            const queryObject = {
                k: q.key,
                v: q.value,
                o: operatorMap[q.operator],
            };
            if (andQueryKeywords.has(q.key)) {
                // eslint-disable-next-line camelcase
                filter.push(queryObject);
            } else {
                // eslint-disable-next-line camelcase
                filter_or.push(queryObject);
                andQueryKeywords.add(q.key);
            }
        });
        // eslint-disable-next-line camelcase
        if (!_.isEmpty(filter)) { query.fliter = filter; }
        // eslint-disable-next-line camelcase
        if (!_.isEmpty(filter_or)) { query.filter_or = filter_or; }
    }
    return query;
};
