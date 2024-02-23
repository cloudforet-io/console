import { computed } from 'vue';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';
import { setI18nLocale } from '@/translations';

import { ERROR_ROUTE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { integralRoutes } from '@/router/integral-routes';

import config from '@/lib/config';
import { initRequestIdleCallback } from '@/lib/request-idle-callback-polyfill';
import { initAmcharts } from '@/lib/site-initializer/amcharts';
import { initAmcharts5 } from '@/lib/site-initializer/amcharts5';
import { initGtag, initGtm } from '@/lib/site-initializer/analysis';
import { initApiClient } from '@/lib/site-initializer/api-client';
import { initDayjs } from '@/lib/site-initializer/dayjs';
import { initDomain } from '@/lib/site-initializer/domain';
import { initDomainSettings } from '@/lib/site-initializer/domain-settings';
import { initErrorHandler } from '@/lib/site-initializer/error-handler';
import { initModeSetting } from '@/lib/site-initializer/mode-setting';
import { prefetchResources } from '@/lib/site-initializer/resource-prefetch';
import { checkSsoAccessToken } from '@/lib/site-initializer/sso';
import { initUserAndAuth } from '@/lib/site-initializer/user-auth';
import { initWorkspace } from '@/lib/site-initializer/workspace';


const initConfig = async () => {
    await config.init();
};

const initQueryHelper = (store) => {
    QueryHelper.init(computed(() => store.state.user.timezone));
};

let isRouterInitialized = false;
const initRouter = (domainId?: string) => {
    if (!domainId) {
        SpaceRouter.init(errorRoutes);
    } else {
        SpaceRouter.init(integralRoutes);
    }
    isRouterInitialized = true;
};

const initI18n = (store) => {
    setI18nLocale(store.state.user.language);
};

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async (store) => {
    /* Init SpaceONE Console */
    try {
        await initConfig();
        await initApiClient(store, config);
        const domainId = await initDomain(store, config);
        const userId = await initUserAndAuth(store, config);
        initDomainSettings(store);
        initModeSetting();
        await initWorkspace(userId);
        initRouter(domainId);
        prefetchResources(userId);
        initI18n(store);
        initDayjs();
        initQueryHelper(store);
        initGtag(store, config);
        initGtm(config);
        initAmcharts(config);
        initAmcharts5(config);
        initErrorHandler(store);
        initRequestIdleCallback();
        await checkSsoAccessToken(store);
    } catch (e) {
        if (!isRouterInitialized) initRouter();
        throw e;
    }
};

const MIN_LOADING_TIME = 1000;
export const siteInit = async (store) => {
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
        await init(store);
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
