import { useFavicon } from '@vueuse/core';

import DefaultLogoImage from '@/assets/images/brand/spaceone-logotype-with-Service-Type.svg';


export const initDomainSettings = (store) => {
    const domainSymbolImage = store.getters['domain/domainSymbolImage'];
    const domainDisplayName = store.getters['domain/domainDisplayName'];
    const domainWordTypeLogoImage = store.getters['domain/domainWordTypeLogoImage'];

    const ogTitleMetaTag = document.createElement('meta');
    ogTitleMetaTag.setAttribute('property', 'og:title');
    const ogImageMetaTag = document.createElement('meta');
    ogImageMetaTag.setAttribute('property', 'og:image');

    if (domainSymbolImage) {
        const favicon = useFavicon();
        favicon.value = domainSymbolImage;
    }

    if (domainDisplayName) {
        document.title = domainDisplayName;
        ogTitleMetaTag.setAttribute('content', domainDisplayName);
    } else {
        ogTitleMetaTag.setAttribute('content', 'SpaceONE');
    }

    if (domainWordTypeLogoImage) {
        ogImageMetaTag.setAttribute('content', domainWordTypeLogoImage);
    } else {
        ogImageMetaTag.setAttribute('content', DefaultLogoImage);
    }

    // Open Graph Meta Tag
    document.head.appendChild(ogTitleMetaTag);
    document.head.appendChild(ogImageMetaTag);
};
