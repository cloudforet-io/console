import axios from 'axios';
import VueCookies from 'vue-cookies';
import jwt from 'jsonwebtoken';
import prefixPropName from 'bootstrap-vue/esm/utils/prefix-prop-name';
import { object } from '@storybook/addon-knobs';
import construct from '@babel/runtime-corejs2/helpers/esm/construct';

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
    '': 'contain_in', // merge operator
    '!': 'not_contain', // merge operator
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    '=': 'in', // merge operator
    '!=': 'not_in', // merge operator
    $: 'regex',
});

const mergeOperatorSet = new Set(['contain_in', 'not_contain_in', 'in', 'not_in']);

/**
 * @name defaultQuery
 * @description make default query format
 * @param thisPage
 * @param pageSize
 * @param sortBy
 * @param sortDesc
 * @param searchText
 * @param searchQueries
 * @param valueFormatter <(key,value)=>value>
 * @returns {{page: {start: number, limit: *}}}
 */
export const defaultQuery = (thisPage, pageSize, sortBy, sortDesc, searchText, searchQueries, valueFormatter) => {
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
    if (searchQueries) {
        const filter = [];
        // eslint-disable-next-line camelcase
        const mergeOpQuery = {};
        searchQueries.forEach((q) => {
            const op = operatorMap[q.operator];
            const value = valueFormatter ? valueFormatter(q.key, q.value) : q.value;
            if (mergeOperatorSet.has(op)) {
                const prefix = `${q.key}:${op}`;
                if (mergeOpQuery[prefix]) {
                    mergeOpQuery[prefix].v.push(value);
                } else {
                    mergeOpQuery[prefix] = {
                        k: q.key,
                        v: [value],
                        o: op,
                    };
                }
            } else {
                filter.push({
                    k: q.key,
                    v: value,
                    o: op,
                });
            }
        });
        // eslint-disable-next-line camelcase
        if (!_.isEmpty(filter) || !_.isEmpty(mergeOpQuery)) { query.filter = [...filter, ...Object.values(mergeOpQuery)]; }
    }
    return query;
};
