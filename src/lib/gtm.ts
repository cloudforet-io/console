import Vue from 'vue';

import VueGtm from '@gtm-support/vue2-gtm';

import config from '@/lib/config';

export class Gtm {
    private static _gtm: null|Gtm = null;

    constructor() {
        const gtmId: string = config.get('GTM_ID');
        if (!gtmId || gtmId === 'DISABLED') {
            console.log('GTM ID is not given.');
            Gtm._gtm = null;
            return;
        }
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
        try {
            Gtm._gtm = new Gtm();
        } catch (e) {
            console.error(e);
            Gtm._gtm = null;
        }
    }

    static get gtm(): null|Gtm {
        return Gtm._gtm;
    }
}
