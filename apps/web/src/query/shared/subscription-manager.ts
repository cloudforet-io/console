type QueryCacheUnsubscribe = () => void;

const registry = new FinalizationRegistry((unsubscribe: QueryCacheUnsubscribe) => {
    unsubscribe();
});

export const subscriptionManager = {
    register(targetObject: object, unsubscribe: QueryCacheUnsubscribe) {
        registry.register(targetObject, unsubscribe);
    },
};
