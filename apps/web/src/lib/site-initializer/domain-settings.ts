import { useFavicon } from '@vueuse/core';

import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';


export const initDomainSettings = () => {
    const domainStore = useDomainStore(pinia);
    const domainSymbolImage = domainStore.getters.domainSymbolImage;
    const domainDisplayName = domainStore.getters.domainDisplayName;

    if (domainSymbolImage) {
        const favicon = useFavicon();
        favicon.value = domainSymbolImage;
    }
    if (domainDisplayName) {
        document.title = domainDisplayName;
    }
};
