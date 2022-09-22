import Vue from 'vue';

import VueGtm from '@gtm-support/vue2-gtm';

import config from '@/lib/config';

export class Gtm {
    constructor() {
        const gtmId: string = config.get('GTM_ID') || 'DISABLED';
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
