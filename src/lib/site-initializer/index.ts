import { computed } from '@vue/composition-api';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import Vue from 'vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { setI18nLocale } from '@/translations';

import { errorRoutes } from '@/router/error-routes';
import { serviceRoutes } from '@/router/service-routes';

import { addAmchartsLicense, applyAmchartsGlobalSettings } from '@/lib/amcharts/global-settings';
import config from '@/lib/config';
import { GTag } from '@/lib/gtag';
import { Gtm } from '@/lib/gtm';
import { isMobile } from '@/lib/helper/cross-browsing-helper';
import { initRequestIdleCallback } from '@/lib/request-idle-callback-polyfill';
import { initApiClient } from '@/lib/site-initializer/api-client';
import { initDayjs } from '@/lib/site-initializer/dayjs';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';


const initConfig = async () => {
    await config.init();
};

const initDomain = async (): Promise<string|undefined> => {
    let domainName;
    if (config.get('DOMAIN_NAME_REF') === 'hostname') {
        const { hostname } = window.location;
        domainName = hostname.split('.')[0];
    } else {
        domainName = config.get('DOMAIN_NAME');
    }

    try {
        await Promise.allSettled([
            store.dispatch('domain/load', domainName),
            store.dispatch('domain/setBillingEnabled'),
        ]);
        return store.state.domain.name;
    } catch (e) {
        console.error(e);
        return undefined;
    }
};

const initGtag = () => {
    if (config.get('GTAG_ID') === 'DISABLED') return;
    GTag.init();
    store.watch(state => state.user.userId, (userId) => {
        GTag.setGtagUserID(store.state.domain.domainId, userId);
    }, { immediate: true });
};

const initGtm = () => {
    if (config.get('GTM_ID') === 'DISABLED') return;
    Gtm.init();
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

const initAmcharts = () => {
    if (config.get('AMCHARTS_LICENSE.ENABLED')) {
        addAmchartsLicense([
            config.get('AMCHARTS_LICENSE.CHARTS'),
            config.get('AMCHARTS_LICENSE.MAPS'),
            config.get('AMCHARTS_LICENSE.TIMELINE'),
        ]);
    }
    applyAmchartsGlobalSettings();
};

const initErrorHandler = () => {
    Vue.config.errorHandler = error => ErrorHandler.handleError(error);
    ErrorHandler.init({
        authenticationErrorHandler: () => {
            store.dispatch('error/showSessionExpiredError');
            store.dispatch('user/setIsSessionExpired', true);
        },
        authorizationErrorHandler: () => {
            store.dispatch('error/showAuthorizationError');
        },
    });
};

const checkSsoAccessToken = async () => {
    if (window.location.pathname === '/reset-password') {
        if (isMobile()) store.dispatch('display/showMobileGuideModal');
        return;
    }
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const ssoAccessToken = params.get('sso_access_token');
    // signOut
    if (ssoAccessToken) {
        if (SpaceConnector.isTokenAlive) {
            try {
                const authType = store.state.domain.extendedAuthType;
                await loadAuth(authType).signOut();
                await store.dispatch('user/setIsSessionExpired', true);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        if (isMobile()) store.dispatch('display/showMobileGuideModal');
        else window.location.pathname = 'reset-password';
    }
};

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async () => {
    /* Init SpaceONE Console */
    await initConfig();
    await initApiClient(store, config);
    const domainName = await initDomain();

    if (domainName) {
        initRouter(domainName);
        initI18n();
        initDayjs();
        initQueryHelper();
        initGtag();
        initGtm();
        initAmcharts();
        initErrorHandler();
        initRequestIdleCallback();
        await checkSsoAccessToken();
    } else {
        initRouter();
        throw new Error('Site initialization failed: No matched domain');
    }
};


const MIN_LOADING_TIME = 1000;
export const siteInit = async () => {
    store.dispatch('display/startInitializing');

    store.watch(state => state.display.isInitialized, (isInitialized) => {
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
            await SpaceRouter.router.push('/error-page');
        }
    } finally {
        isFinishedInitializing = true;
        if (isMinTimePassed) {
            store.dispatch('display/finishInitializing');
            removeInitializer();
        }
    }
};
