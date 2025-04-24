import type { QueryClient, QueryKey } from '@tanstack/vue-query';

type QuerySummary = {
    index: number;
    queryKey: QueryKey;
    gcTime: number;
    observers: number;
    data: unknown;
};

export function initVueQueryConsoleDebug(client: QueryClient) {
    const _summarizeQueries = (): QuerySummary[] => client.getQueryCache().getAll().map((query, index) => ({
        index,
        queryKey: query.queryKey,
        gcTime: query.gcTime,
        observers: query.getObserversCount?.() ?? query.observers.length,
        data: query.state.data,
    }));

    const debugObject = {
        getSummary: _summarizeQueries,
        dump: () => console.table(_summarizeQueries().map((q) => ({
            appContext: _extractAppContext(q.queryKey),
            resourceIdentifier: _extractResourceIdentifier(q.queryKey),
            contextKey: _extractContextKey(q.queryKey),
            params: _extractParams(q.queryKey),
            observers: q.observers,
        }))),
        log: () => {
            _summarizeQueries().forEach((q, i) => {
                console.group(`Query #${i + 1}`);
                console.log('queryKey:', q.queryKey);
                console.log('gcTime:', q.gcTime);
                console.log('observers:', q.observers);
                console.log('data:', q.data);
                console.groupEnd();
            });
        },
        inspect: (index: number) => {
            const q = _summarizeQueries()[index];
            if (!q) {
                console.warn('Query index not found');
                return;
            }
            console.group(`Inspecting Query #${index}`);
            console.log('queryKey:', q.queryKey);
            console.log('gcTime:', q.gcTime);
            console.log('observers:', q.observers);
            console.log('data:', q.data);
            console.groupEnd();
        },
    };

    (window as any).__QUERY_DEBUG__ = debugObject;
}

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
    if (key[0] === 'admin' && typeof key[4] === 'string') return key[4];
    if (key.length < 6) return '';
    if (key[0] === 'workspace' && typeof key[5] === 'string') return key[5];
    return '';
};

const _extractParams = (key: QueryKey): string => {
    if (!Array.isArray(key) || key.length < 6) return '';
    if (key[0] === 'admin') return JSON.stringify(typeof key[5] === 'string' ? key[6] : key[5]);
    if (key.length < 7) return '';
    if (key[0] === 'workspace') return JSON.stringify(typeof key[6] === 'string' ? key[7] : key[6]);
    return '';
};
