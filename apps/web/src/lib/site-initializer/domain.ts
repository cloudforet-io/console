export const initDomain = async (store, config): Promise<string> => {
    let domainName;
    if (config.get('DOMAIN_NAME_REF') === 'hostname') {
        const { hostname } = window.location;
        domainName = hostname.split('.')[0];
    } else {
        domainName = config.get('DOMAIN_NAME');
    }

    try {
        await store.dispatch('domain/load', domainName);
        return store.state.domain.domainId;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to load domain.');
    }
};
