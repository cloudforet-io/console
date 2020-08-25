import Vue from 'vue';
import VueGtag from 'vue-gtag';
import Hashids from 'hashids';
import config from '@/lib/config';
import { useStore } from '@/store/toolset';

export const setGtagUserID = (vm: any) => {
    const store = useStore();
    if (store && vm.$gtag) {
        try {
            if (store.domain?.state?.domainId && store.user?.state?.userId) {
                const hashids = new Hashids(store.user.state.userId);

                // eslint-disable-next-line camelcase
                vm.$gtag.set({
                    // eslint-disable-next-line camelcase
                    user_id: `${store.domain.state.domainId}:${hashids.encode(1)}`,
                    domain_id: store.domain.state.domainId,
                });
            }
        } catch (e) {
            console.error('init gtag userid fail', e);
        }
    } else if (config.get('GTAG_ID') !== 'DISABLED') {
        console.error('not set $gtag');
    }
};

export class GTag {
    gtag: any;

    constructor(id: string, vm: Vue) {
        const gtagId: string = id || 'DISABLED';

        if (gtagId === 'DISABLED') return;
        Vue.use(VueGtag, {
            config: { id: gtagId },
        });
        this.gtag = vm.$gtag;

        vm.$router.afterEach((to, from) => {
            this.gtag.pageview({
                // eslint-disable-next-line camelcase
                page_path: to.path,
            });
        });
    }
}
