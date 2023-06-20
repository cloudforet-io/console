import { createGtm } from '@gtm-support/vue-gtm';
import type { App } from 'vue';

import config from '@/lib/config';


export class Gtm {
    private static _gtm: null|Gtm = null;

    constructor(app: App) {
        const gtmId: string = config.get('GTM_ID');
        if (!gtmId || gtmId === 'DISABLED') {
            console.log('GTM ID is not given.');
            Gtm._gtm = null;
            return;
        }

        const gtm = createGtm({
            id: gtmId,
            defer: false,
            compatibility: false,
            nonce: '',
            enabled: true,
            trackOnNextTick: false,
        });

        app.use(gtm);
    }

    static init(app: App) {
        try {
            Gtm._gtm = new Gtm(app);
        } catch (e) {
            console.error(e);
            Gtm._gtm = null;
        }
    }

    static get gtm(): null|Gtm {
        return Gtm._gtm;
    }
}
