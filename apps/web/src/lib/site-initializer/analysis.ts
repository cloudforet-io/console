import { watch } from 'vue';

import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import { GTag } from '@/lib/site-analytics/gtag';
import { Gtm } from '@/lib/site-analytics/gtm';

export const initGtag = (config) => {
    if (config.get('GTAG_ID') === 'DISABLED') return;
    GTag.init();

    const domainStore = useDomainStore(pinia);
    const userStore = useUserStore(pinia);
    watch(() => userStore.state.userId, (userId) => {
        GTag.setGtagUserID(domainStore.state.domainId, userId, domainStore.state.name);
    }, { immediate: true });
};

export const initGtm = (config) => {
    if (config.get('GTM_ID') === 'DISABLED') return;
    Gtm.init();
};
