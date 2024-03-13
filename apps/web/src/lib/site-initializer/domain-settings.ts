import { useFavicon } from '@vueuse/core';


export const initDomainSettings = (store) => {
    const domainSymbolImage = store.getters['domain/domainSymbolImage'];
    const domainDisplayName = store.getters['domain/domainDisplayName'];

    if (domainSymbolImage) {
        const favicon = useFavicon();
        favicon.value = domainSymbolImage;
    }
    if (domainDisplayName) {
        document.title = domainDisplayName;
    }
};
