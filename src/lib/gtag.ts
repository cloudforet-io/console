import Vue from 'vue';
import VueGtag from 'vue-gtag';
import { useStore } from '@/store/toolset';

export const setGtagUserID = (gtag: any) => {
    const { user: userStore } = useStore();
    if (userStore.state.userId) {
        // eslint-disable-next-line camelcase
        gtag('set', { user_id: userStore.state.userId });
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
        setGtagUserID(this.gtag);

        vm.$router.afterEach((to, from) => {
            this.gtag.pageview({
                // eslint-disable-next-line camelcase
                page_path: to.path,
            });
        });
    }
}
