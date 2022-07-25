import { computed } from '@vue/composition-api';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import Vue from 'vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { initI18n } from '@/translations';

import { adminDomainServiceRoutes } from '@/router/admin-domain-service-routes';
import { errorRoutes } from '@/router/error-routes';
import { serviceRoutes } from '@/router/service-routes';

import { addAmchartsLicense, applyAmchartsGlobalSettings } from '@/lib/amcharts/global-settings';
import config from '@/lib/config';
import { GTag } from '@/lib/gtag';
import { Gtm } from '@/lib/gtm';
import { isMobile } from '@/lib/helper/cross-browsing-helper';
import { initRequestIdleCallback } from '@/lib/request-idle-callback-polyfill';
import { initDayjs } from '@/lib/site-initializer/dayjs';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';


const initConfig = async () => {
    await config.init();
};

const initApiClient = async () => {
    await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
        // Add session expiration process
        store.dispatch('user/setIsSessionExpired', true);
        store.dispatch('error/showSessionExpiredError');
    }, { endpoint: config.get('MOCK.ENDPOINT'), all: config.get('MOCK.ALL') }, {
        '/inventory/cloud-service-type/create': (data) => { store.dispatch('reference/cloudServiceType/sync', data); },
        '/inventory/cloud-service-type/update': (data) => { store.dispatch('reference/cloudServiceType/sync', data); },
        '/inventory/collector/create': (data) => { store.dispatch('reference/collector/sync', data); },
        '/inventory/collector/update': (data) => { store.dispatch('reference/collector/sync', data); },
        '/repository/plugin/create': (data) => { store.dispatch('reference/plugin/sync', data); },
        '/repository/plugin/update': (data) => { store.dispatch('reference/plugin/sync', data); },
        '/identity/project/create': (data) => { store.dispatch('reference/project/sync', data); },
        '/identity/project/update': (data) => { store.dispatch('reference/project/sync', data); },
        '/identity/project-group/create': (data) => { store.dispatch('reference/projectGroup/sync', data); },
        '/identity/project-group/update': (data) => { store.dispatch('reference/projectGroup/sync', data); },
        '/notification/protocol/create': (data) => { store.dispatch('reference/protocol/sync', data); },
        '/notification/protocol/update': (data) => { store.dispatch('reference/protocol/sync', data); },
        '/identity/provider/create': (data) => { store.dispatch('reference/provider/sync', data); },
        '/identity/provider/update': (data) => { store.dispatch('reference/provider/sync', data); },
        '/inventory/region/create': (data) => { store.dispatch('reference/region/sync', data); },
        '/inventory/region/update': (data) => { store.dispatch('reference/region/sync', data); },
        '/secret/secret/create': (data) => { store.dispatch('reference/secret/sync', data); },
        '/secret/secret/update': (data) => { store.dispatch('reference/secret/sync', data); },
        '/identity/service-account/create': (data) => { store.dispatch('reference/serviceAccount/sync', data); },
        '/identity/service-account/update': (data) => { store.dispatch('reference/serviceAccount/sync', data); },
        '/identity/user/create': (data) => { store.dispatch('reference/user/sync', data); },
        '/identity/user/update': (data) => { store.dispatch('reference/user/sync', data); },
        '/monitoring/webhook/create': (data) => { store.dispatch('reference/webhook/sync', data); },
        '/monitoring/webhook/update': (data) => { store.dispatch('reference/webhook/sync', data); },
    });
    const isTokenAlive = SpaceConnector.isTokenAlive;
    store.dispatch('user/setIsSessionExpired', !isTokenAlive);
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
        await store.dispatch('domain/load', domainName);
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
    } else if (domainName === config.get('ADMIN_DOMAIN')) {
        SpaceRouter.init(adminDomainServiceRoutes);
    } else {
        SpaceRouter.init(serviceRoutes);
    }
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
    await initApiClient();
    const domainName = await initDomain();

    if (domainName) {
        initRouter(domainName);
        initI18n(store);
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
