import type { QueryClient, QueryKey, Query } from '@tanstack/vue-query';

type QuerySummary = {
    index: number;
    queryKey: QueryKey;
    gcTime: number;
    observers: number;
    data: unknown;
    query: Query;
    isActive: boolean;
};
interface DumpOptions {
    appContext?: string;
    resourceIdentifier?: string;
    activeOnly?: boolean;
    // TODO: Add sortBy, limit, showParamsSize, intentLabel support
}


export const initVueQueryConsoleDebug = (client: QueryClient) => {
    const _summarizeQueries = (): QuerySummary[] => client.getQueryCache().getAll()
        .sort((a, b) => {
            const isActiveA = _isActive(a);
            const isActiveB = _isActive(b);
            return Number(isActiveB) - Number(isActiveA);
        })
        .map((query, index) => {
            const data = query.state.data;
            const observers = query.getObserversCount?.() ?? query.observers.length;

            return {
                index: index + 1,
                queryKey: query.queryKey,
                gcTime: query.gcTime,
                observers,
                data,
                query,
                isActive: _isActive(query),
            };
        });

    const debugObject = {
        /**
         * Returns a raw summary of all queries in the cache.
         */
        getSummary: _summarizeQueries,
        /**
         * Logs a table summary of all queries.
         * Includes appContext, resource path, context keys, and params.
         */
        dump: (options?: DumpOptions) => {
            let summary = _summarizeQueries().map((q) => ({
                index: q.index,
                appContext: _extractAppContext(q.queryKey),
                resourceIdentifier: _extractResourceIdentifier(q.queryKey),
                contextKey: _extractContextKey(q.queryKey),
                params: _extractParams(q.queryKey),
                observers: q.observers,
                isActive: q.isActive,
            }));
            if (options?.appContext) {
                summary = summary.filter((q) => q.appContext.startsWith(options?.appContext ?? ''));
            }
            if (options?.resourceIdentifier) {
                summary = summary.filter((q) => q.resourceIdentifier.startsWith(options?.resourceIdentifier ?? ''));
            }
            if (options?.activeOnly) {
                summary = summary.filter((q) => q.isActive);
            }
            const result = Object.fromEntries(summary.map((q) => [`${q.index}`, {
                appContext: q.appContext,
                resourceIdentifier: q.resourceIdentifier,
                contextKey: q.contextKey,
                params: q.params,
                observers: q.observers,
                isActive: q.isActive,
            }]));

            console.table(result);
        },
        /**
         * Logs full details for every query in the cache.
         * Grouped and expanded in the browser console.
         */
        log: () => {
            _summarizeQueries().forEach((q) => {
                console.group(`Query #${q.index}`);
                console.log('queryKey:', q.queryKey);
                console.log('gcTime:', q.gcTime);
                console.log('observers:', q.observers);
                console.log('data:', q.data);
                console.groupEnd();
            });
        },
        /**
         * Logs details for a specific query by its index in the cache.
         */
        inspect: (index: number) => {
            const q = _summarizeQueries().find((query) => query.index === index);
            if (!q) {
                console.warn('Query index not found');
                (window as any).__QUERY_DEBUG__.dump();
                return;
            }
            console.group(`Inspecting Query #${index}`);
            console.log('queryKey:', q.queryKey);
            console.log('gcTime:', q.gcTime);
            console.log('observers:', q.observers);
            console.log('data:', q.data);
            console.log('query:', q.query);
            console.groupEnd();
        },
    };

    (window as any).__QUERY_DEBUG__ = debugObject;
};


const _isActive = (query: Query) => {
    const data = query.state.data;
    return (data !== undefined && query.state.dataUpdatedAt > 0) || (query.options as { enabled?: boolean })?.enabled === true;
};

/* --------------------- Extractors --------------------- */

const _extractAppContext = (key: QueryKey): string => {
    if (!Array.isArray(key) || key.length === 0) return '';
    if (key[0] === 'admin') return 'admin';
    if (key.length < 2) return '';
    if (key[0] === 'workspace') return `${key[1]}`;
    return '';
};

const _extractResourceIdentifier = (key: QueryKey): string => {
    if (!Array.isArray(key) || key.length < 4) return '';
    if (key[0] === 'admin') return `${key[1]}/${key[2]}/${key[3]}`;
    if (key.length < 5) return '';
    if (key[0] === 'workspace') return `${key[2]}/${key[3]}/${key[4]}`;
    return '';
};

const _extractContextKey = (key: QueryKey): string => {
    if (!Array.isArray(key) || key.length < 5) return '';
    const startIndex = key[0] === 'admin' ? 4 : 5;
    const lastIndex = key.length - 1;
    const hasParams = typeof key[lastIndex] === 'object' && !Array.isArray(key[lastIndex]) && key[lastIndex] !== null;

    const contextPart = hasParams ? key.slice(startIndex, lastIndex) : key.slice(startIndex);
    const parts = contextPart.filter((k) => typeof k === 'string' || typeof k === 'number');

    return parts.join(', ');
};

const _extractParams = (key: QueryKey): string => {
    if (!Array.isArray(key) || key.length < 5) return '';
    if (key[0] === 'admin') {
        const lastNamespace = key[key.length - 1];
        return typeof lastNamespace === 'object' ? JSON.stringify(lastNamespace) : '';
    }
    if (key.length < 6) return '';
    if (key[0] === 'workspace') {
        const lastNamespace = key[key.length - 1];
        return typeof lastNamespace === 'object' ? JSON.stringify(lastNamespace) : '';
    }
    return '';
};
