import { GTag } from '@/lib/gtag';
import { Gtm } from '@/lib/gtm';

export const initGtag = (store, config) => {
    if (config.get('GTAG_ID') === 'DISABLED') return;
    GTag.init();
    store.watch((state) => state.user.userId, (userId) => {
        GTag.setGtagUserID(store.state.domain.domainId, userId);
    }, { immediate: true });
};

export const initGtm = (config) => {
    if (config.get('GTM_ID') === 'DISABLED') return;
    Gtm.init();
};
