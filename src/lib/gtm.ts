import VueGtm from '@gtm-support/vue2-gtm';
import Vue from 'vue';

import config from '@/lib/config';

export class Gtm {
    constructor() {
        const gtmId: string = config.get('GTM_ID') || 'GTM-PKX68HW';
        Vue.use(VueGtm, {
            id: gtmId,
            defer: false,
            compatibility: false,
            nonce: '',
            enabled: true,
            trackOnNextTick: false,
        });
    }

    static init() {
        new Gtm();
    }
}
