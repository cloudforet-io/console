import { computed } from 'vue';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { setI18nLocale } from '@/translations';

import { ERROR_ROUTE, errorRoutes } from '@/router/error-routes';
import { serviceRoutes } from '@/router/service-routes';

import config from '@/lib/config';
import { initRequestIdleCallback } from '@/lib/request-idle-callback-polyfill';
import { initAmcharts } from '@/lib/site-initializer/amcharts';
import { initAmcharts5 } from '@/lib/site-initializer/amcharts5';
import { initGtag, initGtm } from '@/lib/site-initializer/analysis';
import { initApiClient } from '@/lib/site-initializer/api-client';
import { initDayjs } from '@/lib/site-initializer/dayjs';
import { initDomain } from '@/lib/site-initializer/domain';
import { initErrorHandler } from '@/lib/site-initializer/error-handler';
import { checkSsoAccessToken } from '@/lib/site-initializer/sso';

const initConfig = async () => {
    await config.init();
};

const initQueryHelper = () => {
    QueryHelper.init(computed(() => store.state.user.timezone));
};

const initRouter = (domainName?: string) => {
    if (!domainName) {
        SpaceRouter.init(errorRoutes);
    } else {
        SpaceRouter.init(serviceRoutes);
    }
};

const initI18n = () => {
    setI18nLocale(store.state.user.language);
};

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async () => {
    /* Init SpaceONE Console */
    await initConfig();
    await initApiClient(store, config);
    const domainName = await initDomain(store, config);

    if (domainName) {
        initI18n();
        initDayjs();
        initQueryHelper();
        initGtag(store, config);
        initGtm(config);
        initAmcharts(config);
        initAmcharts5(config);
        initRouter(domainName);
        initErrorHandler(store);
        initRequestIdleCallback();
        LocalStorageAccessor.init();
        await checkSsoAccessToken(store);
    } else {
        initRouter();
        throw new Error('Site initialization failed: No matched domain');
    }
};

const MIN_LOADING_TIME = 1000;
export const siteInit = async () => {
    store.dispatch('display/startInitializing');

    store.watch((state) => state.display.isInitialized, (isInitialized) => {
        if (isInitialized) {
            const el = document.getElementById('site-loader-wrapper');
            if (el?.parentElement) el.parentElement.removeChild(el);
        }
    });

    let isMinTimePassed = false;
    let isFinishedInitializing = false;

    setTimeout(() => {
        isMinTimePassed = true;
        if (isFinishedInitializing) {
            store.dispatch('display/finishInitializing');
            removeInitializer();
        }
    }, MIN_LOADING_TIME);

    try {
        await init();
    } catch (e) {
        console.error(e);
        store.dispatch('display/finishInitializing');

        if (SpaceRouter.router) {
            await SpaceRouter.router.push({ name: ERROR_ROUTE._NAME });
        }
    } finally {
        isFinishedInitializing = true;
        if (isMinTimePassed) {
            store.dispatch('display/finishInitializing');
            removeInitializer();
        }
    }
};
