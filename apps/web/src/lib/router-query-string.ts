import { forEach } from 'lodash';
import type { RouteLocation, LocationQueryValue } from 'vue-router';

import { SpaceRouter } from '@/router';

// export type RouteQueryString = string | (string | null)[] | null | undefined;
export type RouteQueryString = LocationQueryValue | LocationQueryValue[] | undefined;
export interface ConvertValueToQueryString {
    (value?: any): RouteQueryString;
}
export interface ConvertQueryStringToValue<T = any> {
    (queryString?: RouteQueryString): T|undefined;
}

/**
 * @param keyOrQuery?
 * @param value?
 * @description replace url query. if no key is given, it replace empty query.
 */
export const replaceUrlQuery = async (keyOrQuery?: string|Record<string, RouteQueryString>, value?: RouteQueryString) => {
    let query: Record<string, RouteQueryString> = {};

    if (typeof keyOrQuery === 'string') {
        const key = keyOrQuery;
        query = { ...SpaceRouter.router.currentRoute.value.query };
        if ((value === null || value === undefined) && query[key]) delete query[key];
        else query[key] = value;
    } else if (typeof keyOrQuery === 'object') {
        const queryKeys = Object.keys(keyOrQuery);
        query = { ...SpaceRouter.router.currentRoute.value.query };
        queryKeys.forEach((key) => {
            const queryValue = keyOrQuery[key] as RouteQueryString;
            if ((queryValue === null || queryValue === undefined) && query[key]) delete query[key];
            else query[key] = queryValue;
        });
    }

    try {
        await SpaceRouter.router.replace({ query });
    } catch (e) {}
};

/** QueryString to Value Converter Helpers */

/**
 * @param queryString
 * @description convert url query string to array or undefined.
 */
export function queryStringToArray<T = any>(queryString: RouteQueryString): T[]|undefined {
    if (queryString) {
        if (Array.isArray(queryString)) {
            return queryString.map((d) => {
                if (d) return JSON.parse(d);
                return d;
            });
        }

        try {
            const value = JSON.parse(queryString);
            if (Array.isArray(value)) return value;
        } catch (e) {
            return [queryString] as unknown as T[];
        }
    }

    return undefined;
}

/**
 * @param queryString
 * @description convert url query string to object or undefined.
 */
export function queryStringToObject<T = any>(queryString: RouteQueryString): T|undefined {
    let value;

    if (queryString) {
        if (Array.isArray(queryString)) {
            const firstItem = queryString[0];
            if (!firstItem) return undefined;

            value = firstItem;
        } else {
            value = queryString;
        }
    }

    try {
        value = JSON.parse(value);
    } catch (e) {
        return undefined;
    }

    return typeof value === 'object' ? value : undefined;
}

/**
 * @param queryString
 * @description convert url query string to boolean or undefined.
 */
export const queryStringToBoolean = (queryString: RouteQueryString): boolean|undefined => {
    if (queryString && typeof queryString === 'string') {
        const value = JSON.parse(queryString);
        if (typeof value === 'boolean') return value;
    }

    return undefined;
};

/**
 * @param queryString
 * @description convert url query string to number or undefined.
 */
export const queryStringToNumber = (queryString: RouteQueryString): number|undefined => {
    if (queryString && typeof queryString === 'string') {
        const value = JSON.parse(queryString);
        if (typeof value === 'number') return value;
    }

    return undefined;
};

/**
 * @param queryString
 * @description convert url query string to string or undefined.
 */
export const queryStringToString = (queryString: RouteQueryString): string|undefined => {
    let value = queryString;
    if (Array.isArray(value)) value = value[0];
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) || undefined;
        } catch (e) {
            return value || undefined;
        }
    }

    return undefined;
};

/** Value to QueryString Converter Helpers */

/**
 * @param value
 * @description convert boolean, string, number or undefined to url query string.
 */
export const primitiveToQueryString = (value?: string|boolean|number): RouteQueryString => {
    if (value === undefined) return undefined;
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
};

/**
 * @param value
 * @description convert object or undefined to url query string.
 */
export const objectToQueryString = (value?: Record<string|number, any>): RouteQueryString => {
    if (!value || Object.keys(value).length === 0) return undefined;
    return JSON.stringify(value);
};

/**
 * @param value
 * @description convert array or undefined to url query string.
 */
export const arrayToQueryString = (value?: any[]): RouteQueryString => {
    if (!value || value.length === 0) return undefined;
    return JSON.stringify(value);
};

/**
 * @param locationQuery
 * @description convert location query to search filters. will be DEPRECATED.
 */
export const locationQueryToString = (locationQuery: RouteLocation['query']): string => {
    if (!locationQuery) return '';
    const queryStrings: string[] = [];
    forEach(locationQuery, (v, k) => {
        if (k === 'filters') {
            let filters: string[] = locationQuery.filters as string[];
            filters = filters.map((d) => `filters=${d}`);
            queryStrings.push(...filters);
        } else {
            queryStrings.push(`${k}=${v}`);
        }
    });
    return queryStrings.join('&');
};
