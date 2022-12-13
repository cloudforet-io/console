import Vue from 'vue';
import type { VueGtag as VueGtagType } from 'vue-gtag';
import VueGtag from 'vue-gtag';
import type { Route } from 'vue-router';

import Hashids from 'hashids';

import config from '@/lib/config';

export class GTag {
    private static _gtag: VueGtagType|null;

    constructor() {
        const gtagId: string = config.get('GTAG_ID');
        if (!gtagId || gtagId === 'DISABLED') {
            console.log('GTG ID is not given.');
            GTag._gtag = null;
            return;
        }

        Vue.use(VueGtag, {
            config: { id: gtagId },
        });
        GTag._gtag = Vue.prototype.$gtag;
    }

    static init() {
        new GTag();
    }

    static get gtag(): VueGtagType|null {
        return GTag._gtag;
    }

    static setGtagUserID(domainId?: string, userId?: string) {
        if (GTag.gtag) {
            try {
                if (domainId && userId) {
                    const hashids = new Hashids(userId);
                    // eslint-disable-next-line camelcase
                    GTag.gtag.set({
                        user_id: `${domainId}:${hashids.encode(1)}`,
                        domain_id: domainId,
                    });
                }
            } catch (e) {
                console.error('failed to init gtag', e);
            }
        } else if (config.get('GTAG_ID') !== 'DISABLED') {
            console.error('GTag is not initialized.');
        }
    }

    static setPageView(to: Route) {
        if (GTag.gtag) {
            GTag.gtag.pageview({
                // eslint-disable-next-line camelcase
                page_path: to.path,
            });
        }
    }
}
