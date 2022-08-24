export const initDomain = async (store, config): Promise<string|undefined> => {
    let domainName;
    if (config.get('DOMAIN_NAME_REF') === 'hostname') {
        const { hostname } = window.location;
        domainName = hostname.split('.')[0];
    } else {
        domainName = config.get('DOMAIN_NAME');
    }

    try {
        await Promise.allSettled([
            // load domain info
            store.dispatch('domain/load', domainName),
            // check if billing menu is accessible from current domain
            store.dispatch('domain/setBillingEnabled'),
        ]);
        return store.state.domain.name;
    } catch (e) {
        console.error(e);
        return undefined;
    }
};
