import Vue from 'vue';
import VueGtag from 'vue-gtag';
import Hashids from 'hashids';
import config from '@/lib/config';

export const setGtagUserID = (vm: any) => {
    if (vm.$ls && vm.$gtag) {
        try {
            if (vm.$ls.domain?.state?.domainId && vm.$ls.user?.state?.userId) {
                const hashids = new Hashids(vm.$ls.user.state.userId);

                // eslint-disable-next-line camelcase
                vm.$gtag.set({
                    // eslint-disable-next-line camelcase
                    user_id: `${vm.$ls.domain.state.domainId}:${hashids.encode(1)}`,
                    domain_id: vm.$ls.domain.state.domainId,
                });
            }
        } catch (e) {
            console.error('init gtag userid fail', e);
        }
    } else if (config.get('GTAG_ID') !== 'DISABLED') {
        console.error('not set $ls or $gtag');
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
