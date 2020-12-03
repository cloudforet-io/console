import VueGtag from 'vue-gtag';
import Hashids from 'hashids';
import config from '@/lib/config';
import { VueRouter } from 'vue-router/types/router';
import { VueConstructor } from 'vue/types/umd';
import { Vue } from 'vue/types/vue';
import { store } from '@/store';

export const setGtagUserID = (vue: Vue) => {
    if (vue.$gtag) {
        try {
            if (store.state.domain.domainId && store.state.user.userId) {
                const hashids = new Hashids(store.state.user.userId);
                // eslint-disable-next-line camelcase
                vue.$gtag.set({
                    // eslint-disable-next-line camelcase
                    user_id: `${store.state.domain.domainId}:${hashids.encode(1)}`,
                    domain_id: store.state.domain.domainId,
                });
            }
        } catch (e) {
            console.error('failed to init gtag', e);
        }
    } else if (config.get('GTAG_ID') !== 'DISABLED') {
        console.error('not set $gtag');
    }
};

export class GTag {
    gtag: any;

    constructor(id: string, vue: VueConstructor|any, router: VueRouter) {
        const gtagId: string = id || 'DISABLED';

        if (gtagId === 'DISABLED') return;
        if (vue.use) {
            vue.use(VueGtag, {
                config: { id: gtagId },
            });
            this.gtag = vue.prototype.$gtag;
        } else {
            this.gtag = vue.$gtag;
        }

        router.afterEach((to, from) => {
            this.gtag.pageview({
                // eslint-disable-next-line camelcase
                page_path: to.path,
            });
        });
    }
}
