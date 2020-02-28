import Vue from 'vue';
import VueGtag from 'vue-gtag';
import config from '@/lib/config';

export class GTag {
    constructor() {
        const id:string = config.get('GTAG_ID') || 'DISABLED';
        if (id === 'DISABLED') return;
        Vue.use(VueGtag, {
            config: { id },
        });
    }
}
