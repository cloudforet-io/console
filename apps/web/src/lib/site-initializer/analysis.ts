import type { App } from 'vue';

import type { Store } from '@/store';

import { GTag } from '@/lib/gtag';
import { Gtm } from '@/lib/gtm';

export const initGtag = (app: App, store: Store, config) => {
    if (config.get('GTAG_ID') === 'DISABLED') return;
    GTag.init(app);
    store.watch((state) => state.user.userId, (userId) => {
        GTag.setGtagUserID(store.state.domain.domainId, userId);
    }, { immediate: true });
};

export const initGtm = (app: App, config) => {
    if (config.get('GTM_ID') === 'DISABLED') return;
    Gtm.init(app);
};
