import Vue from 'vue';
import VueGtag from 'vue-gtag';
import { useStore } from '@/store/toolset';

export const setGtagUserID = (vm: any) => {
    if (vm.$ls && vm.$gtag) {
        try {
            if (vm.$ls.user.state.userId) {
                // eslint-disable-next-line camelcase
                vm.$gtag.set({ user_id: vm.$ls.user.state.userId });
            }
        } catch (e) {
            console.error('init gtag userid fail', e);
        }
    } else {
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
