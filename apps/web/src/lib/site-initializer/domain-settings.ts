import { useFavicon } from '@vueuse/core';


export const initDomainSettings = (store) => {
    const domainSettings = store.state.domain.config?.settings;

    if (domainSettings?.symbol_favicon_url) {
        const favicon = useFavicon();
        favicon.value = domainSettings.symbol_favicon_url;
    }
    if (domainSettings?.display_name) {
        document.title = domainSettings.display_name;
    }
};
