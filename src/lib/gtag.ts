import Vue from 'vue';
import VueGtag from 'vue-gtag';


export class GTag {
    public gtag: any;

    constructor(id:string, vm:Vue) {
        const gtagId:string = id || 'DISABLED';

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
